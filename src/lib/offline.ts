import Dexie, { type Table } from "dexie";
import type { HarvestRecordDraft } from "@/lib/harvest-data";

export type SyncState = "pending" | "syncing" | "synced" | "needs_attention";

type QueueEntryBase = {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  status: SyncState;
  attempts: number;
  lastError?: string;
};

export type HarvestQueueEntry = QueueEntryBase & {
  type: "harvest";
  record: HarvestRecordDraft;
};

export type SaleQueueEntry = QueueEntryBase & {
  type: "sale";
  recordedBy: string;
  productId: number;
  items: Array<{
    product_id: number;
    quantity: number;
    subtotal: number;
  }>;
};

export type OfflineQueueEntry = HarvestQueueEntry | SaleQueueEntry;

export type CachedProduct = {
  id: number;
  name: string;
  default_price: number;
  unit: string;
  is_active: boolean | null;
  updatedAt: string;
};

type OfflineSetting = {
  key: string;
  value: string;
};

class FarmOfflineDatabase extends Dexie {
  syncQueue!: Table<OfflineQueueEntry, string>;
  products!: Table<CachedProduct, number>;
  settings!: Table<OfflineSetting, string>;

  constructor() {
    super("e-and-b-farm-offline");
    this.version(1).stores({
      syncQueue: "id, type, status, userId, createdAt",
      products: "id, updatedAt",
      settings: "key",
    });
  }
}

export const offlineDb = new FarmOfflineDatabase();

export async function cacheProduct(
  product: Omit<CachedProduct, "updatedAt">,
): Promise<void> {
  await offlineDb.products.put({
    ...product,
    updatedAt: new Date().toISOString(),
  });
}

export async function getCachedProduct(
  id: number,
): Promise<CachedProduct | undefined> {
  return offlineDb.products.get(id);
}

const LAST_AUTHENTICATED_USER_KEY = "last-authenticated-user-id";

export async function saveLastAuthenticatedUserId(userId: string): Promise<void> {
  await offlineDb.settings.put({
    key: LAST_AUTHENTICATED_USER_KEY,
    value: userId,
  });
}

export async function getLastAuthenticatedUserId(): Promise<string | null> {
  const setting = await offlineDb.settings.get(LAST_AUTHENTICATED_USER_KEY);
  return setting?.value ?? null;
}

export async function clearLastAuthenticatedUserId(): Promise<void> {
  await offlineDb.settings.delete(LAST_AUTHENTICATED_USER_KEY);
}
