import { useSyncExternalStore } from "react";
import { toast } from "sonner";
import type { HarvestRecordDraft } from "@/lib/harvest-data";
import {
  clearLastAuthenticatedUserId,
  getLastAuthenticatedUserId,
  offlineDb,
  saveLastAuthenticatedUserId,
  type OfflineQueueEntry,
} from "@/lib/offline";
import {
  toSaleItemInsertValues,
  type SaleItemDraft,
} from "@/lib/sales-data";

export type OfflineSyncStatus = {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  needsAttentionCount: number;
};

const initialStatus: OfflineSyncStatus = {
  isOnline: typeof navigator === "undefined" || navigator.onLine,
  isSyncing: false,
  pendingCount: 0,
  needsAttentionCount: 0,
};

let status = initialStatus;
let activeSync: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emitStatus() {
  for (const listener of listeners) listener();
}

async function refreshStatus() {
  const entries = await offlineDb.syncQueue.toArray();
  status = {
    isOnline: navigator.onLine,
    isSyncing: status.isSyncing,
    pendingCount: entries.filter(
      (entry) => entry.status === "pending" || entry.status === "syncing",
    ).length,
    needsAttentionCount: entries.filter(
      (entry) => entry.status === "needs_attention",
    ).length,
  };
  emitStatus();
}

export function subscribeOfflineSyncStatus(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useOfflineSyncStatus() {
  return useSyncExternalStore(
    subscribeOfflineSyncStatus,
    () => status,
    () => initialStatus,
  );
}

async function getCurrentUserId(): Promise<string> {
  const { supabase } = await import("@/lib/supabase/client");
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    if (!navigator.onLine) {
      const lastUserId = await getLastAuthenticatedUserId();
      if (lastUserId) return lastUserId;
    }
    throw error;
  }
  if (!session && !navigator.onLine) {
    const lastUserId = await getLastAuthenticatedUserId();
    if (lastUserId) return lastUserId;
  }
  if (!session) {
    throw new Error("Sign in before saving records for offline sync.");
  }

  await saveLastAuthenticatedUserId(session.user.id);
  return session.user.id;
}

export async function queueHarvestRecord(
  record: HarvestRecordDraft,
): Promise<string> {
  const userId = await getCurrentUserId();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await offlineDb.syncQueue.add({
    id,
    userId,
    type: "harvest",
    record,
    createdAt: now,
    updatedAt: now,
    status: "pending",
    attempts: 0,
  });
  void refreshStatus().catch((error: unknown) =>
    console.error("Unable to refresh offline sync status:", error),
  );
  if (navigator.onLine) {
    void syncPendingRecords().catch((error: unknown) =>
      console.error("Unable to start harvest sync:", error),
    );
  }

  return id;
}

export async function queueSaleRecord(record: {
  recordedBy: string;
  productId: number;
  items: SaleItemDraft[];
}): Promise<string> {
  const userId = await getCurrentUserId();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await offlineDb.syncQueue.add({
    id,
    userId,
    type: "sale",
    recordedBy: record.recordedBy,
    productId: record.productId,
    items: record.items.map((item) => ({
      product_id: record.productId,
      ...toSaleItemInsertValues(item),
    })),
    createdAt: now,
    updatedAt: now,
    status: "pending",
    attempts: 0,
  });
  void refreshStatus().catch((error: unknown) =>
    console.error("Unable to refresh offline sync status:", error),
  );
  if (navigator.onLine) {
    void syncPendingRecords().catch((error: unknown) =>
      console.error("Unable to start sale sync:", error),
    );
  }

  return id;
}

function getErrorDetails(error: unknown) {
  if (error && typeof error === "object") {
    const apiError = error as {
      code?: string;
      message?: string;
      status?: number;
    };
    const permanent =
      apiError.status === 401 ||
      apiError.status === 403 ||
      ["22023", "23503", "23514", "42501"].includes(apiError.code ?? "");
    return {
      message: apiError.message ?? "The server rejected this record.",
      permanent,
    };
  }

  return {
    message: error instanceof Error ? error.message : "Unable to sync record.",
    permanent: false,
  };
}

async function syncEntry(
  entry: OfflineQueueEntry,
  supabase: (typeof import("@/lib/supabase/client"))["supabase"],
) {
  if (entry.type === "harvest") {
    const { error } = await supabase
      .from("harvest_records")
      .upsert(
        {
          client_request_id: entry.id,
          crop_id: 1,
          ...entry.record,
        },
        { onConflict: "client_request_id", ignoreDuplicates: true },
      );
    if (error) throw error;
    return;
  }

  const { data, error } = await supabase.rpc("record_sale", {
    p_recorded_by: entry.recordedBy,
    p_items: entry.items,
    p_client_request_id: entry.id,
  });
  if (error) throw error;
  if (!Number.isFinite(data) || data <= 0) {
    throw new Error("The sale sync returned an invalid sale ID.");
  }
}

export function syncPendingRecords(retryAttention = false): Promise<void> {
  if (activeSync) return activeSync;

  activeSync = (async () => {
    if (!navigator.onLine) {
      await refreshStatus().catch((error: unknown) =>
        console.error("Unable to refresh offline sync status:", error),
      );
      return;
    }

    status = { ...status, isOnline: true, isSyncing: true };
    emitStatus();
    let syncedCount = 0;

    try {
      const { supabase } = await import("@/lib/supabase/client");
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Unable to check authentication before sync:", sessionError);
        return;
      }
      if (!session) return;

      const entries = await offlineDb.syncQueue.toArray();
      for (const entry of entries) {
        if (
          entry.userId !== session.user.id &&
          entry.status === "pending"
        ) {
          await offlineDb.syncQueue.update(entry.id, {
            status: "needs_attention",
            lastError:
              "This record was saved under another account. Sign in with its original account to sync it.",
            updatedAt: new Date().toISOString(),
          });
        }
      }

      if (retryAttention) {
        for (const entry of entries) {
          if (
            entry.userId === session.user.id &&
            entry.status === "needs_attention"
          ) {
            await offlineDb.syncQueue.update(entry.id, {
              status: "pending",
              lastError: undefined,
              updatedAt: new Date().toISOString(),
            });
          }
        }
      }

      const pendingEntries = (await offlineDb.syncQueue.toArray())
        .filter(
          (entry) =>
            entry.userId === session.user.id && entry.status === "pending",
        )
        .sort((left, right) => left.createdAt.localeCompare(right.createdAt));

      for (const entry of pendingEntries) {
        if (!navigator.onLine) break;

        await offlineDb.syncQueue.update(entry.id, {
          status: "syncing",
          attempts: entry.attempts + 1,
          updatedAt: new Date().toISOString(),
        });
        await refreshStatus();

        try {
          await syncEntry(entry, supabase);
          await offlineDb.syncQueue.update(entry.id, {
            status: "synced",
            lastError: undefined,
            updatedAt: new Date().toISOString(),
          });
          syncedCount += 1;
        } catch (error) {
          const details = getErrorDetails(error);
          await offlineDb.syncQueue.update(entry.id, {
            status: details.permanent ? "needs_attention" : "pending",
            lastError: details.message,
            updatedAt: new Date().toISOString(),
          });
          if (details.permanent) {
            toast.error("A saved record needs attention", {
              description: details.message,
            });
          } else {
            console.error("Offline record sync failed:", error);
            if (retryAttention) {
              toast.error("Unable to sync saved records", {
                description: details.message,
              });
            }
            break;
          }
        }
      }

      if (syncedCount > 0) {
        toast.success("Offline changes synced", {
          description: `${syncedCount} ${syncedCount === 1 ? "record was" : "records were"} saved to the farm.`,
        });
      }
    } catch (error) {
      console.error("Unable to synchronize offline records:", error);
    } finally {
      status = { ...status, isSyncing: false };
      await refreshStatus().catch((error: unknown) =>
        console.error("Unable to refresh offline sync status:", error),
      );
    }
  })().finally(() => {
    activeSync = null;
  });

  return activeSync;
}

export function startOfflineSync() {
  let stopped = false;
  let subscription: { unsubscribe: () => void } | undefined;

  const handleOnline = () => {
    status = { ...status, isOnline: true };
    emitStatus();
    void syncPendingRecords().catch((error: unknown) =>
      console.error("Unable to start offline sync:", error),
    );
  };
  const handleOffline = () => {
    status = { ...status, isOnline: false };
    emitStatus();
    void refreshStatus().catch((error: unknown) =>
      console.error("Unable to refresh offline sync status:", error),
    );
  };
  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible" && navigator.onLine) {
      void syncPendingRecords();
    }
  };

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  void refreshStatus().catch((error: unknown) =>
    console.error("Unable to refresh offline sync status:", error),
  );

  void import("@/lib/supabase/client")
    .then(({ supabase }) => {
      if (stopped) return;
      const {
        data: { subscription: authSubscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          void saveLastAuthenticatedUserId(session.user.id).catch(
            (error: unknown) =>
              console.error("Unable to cache the authenticated user:", error),
          );
          window.setTimeout(() => {
            void syncPendingRecords().catch((error: unknown) =>
              console.error("Unable to resume authenticated sync:", error),
            );
          }, 0);
        } else if (event === "SIGNED_OUT") {
          void clearLastAuthenticatedUserId().catch((error: unknown) =>
            console.error("Unable to clear the cached authenticated user:", error),
          );
        }
      });
      subscription = authSubscription;

      return offlineDb.syncQueue.toArray().then(async (entries) => {
        for (const entry of entries) {
          if (entry.status === "syncing") {
            await offlineDb.syncQueue.update(entry.id, {
              status: "pending",
              updatedAt: new Date().toISOString(),
            });
          }
        }
        await refreshStatus();
        if (navigator.onLine) {
          void syncPendingRecords().catch((error: unknown) =>
            console.error("Unable to start offline sync:", error),
          );
        }
      });
    })
    .catch((error: unknown) => {
      console.error("Unable to initialize offline sync:", error);
    });

  return () => {
    stopped = true;
    subscription?.unsubscribe();
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}
