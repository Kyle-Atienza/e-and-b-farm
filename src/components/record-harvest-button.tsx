import { useCallback, useEffect, useState } from "react";
import { ShoppingBasket01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";
import { RecordHarvestDialog } from "@/components/record-harvest-dialog";
import {
  queueHarvestRecord,
  useOfflineSyncStatus,
} from "@/lib/offline-sync";
import { offlineDb } from "@/lib/offline";
import type { HarvestRecordDraft } from "@/lib/harvest-data";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

const manilaDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Manila",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const formatQuantity = new Intl.NumberFormat("en-PH", {
  maximumFractionDigits: 2,
});

export function RecordHarvestButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [todayHarvestTotal, setTodayHarvestTotal] = useState<number | null>(
    null,
  );
  const [isLoadingHarvest, setIsLoadingHarvest] = useState(true);
  const [harvestLoadFailed, setHarvestLoadFailed] = useState(false);
  const syncStatus = useOfflineSyncStatus();

  const loadTodayHarvest = useCallback(
    async (isCurrent: () => boolean = () => true) => {
      try {
      const dateParts = manilaDateFormatter.formatToParts(new Date());
      const today = ["year", "month", "day"]
        .map(
          (type) => dateParts.find((part) => part.type === type)?.value ?? "",
        )
        .join("-");
      const syncedHarvests = new Map<string, number>();
      const { supabase } = await import("@/lib/supabase/client");
      const pageSize = 1000;
      let offset = 0;
      let total = 0;

      while (true) {
        const { data, error } = await supabase
          .from("harvest_records")
          .select("client_request_id, quantity")
          .eq("harvest_date", today)
          .order("id", { ascending: true })
          .range(offset, offset + pageSize - 1);

        if (error) throw error;
        for (const record of data) {
          total += record.quantity ?? 0;
          if (record.client_request_id) {
            syncedHarvests.set(
              record.client_request_id,
              record.quantity ?? 0,
            );
          }
        }
        if (data.length < pageSize) break;
        offset += pageSize;
      }

      const queuedHarvests = await offlineDb.syncQueue
        .where("type")
        .equals("harvest")
        .toArray();
      for (const entry of queuedHarvests) {
        if (entry.type !== "harvest") continue;
        if (
          entry.record.harvest_date === today &&
          entry.status !== "synced" &&
          !syncedHarvests.has(entry.id)
        ) {
          total += entry.record.quantity;
        }
      }

      if (isCurrent()) {
        setTodayHarvestTotal(total);
        setHarvestLoadFailed(false);
      }
    } catch (error) {
      console.error("Unable to load today's harvest:", error);
      if (isCurrent()) setHarvestLoadFailed(true);
    } finally {
      if (isCurrent()) setIsLoadingHarvest(false);
    }
    },
    [],
  );

  useEffect(() => {
    let isCurrent = true;
    void loadTodayHarvest(() => isCurrent);

    return () => {
      isCurrent = false;
    };
  }, [
    loadTodayHarvest,
    syncStatus.isSyncing,
    syncStatus.pendingCount,
    syncStatus.needsAttentionCount,
  ]);

  async function submitHarvest(record: HarvestRecordDraft): Promise<boolean> {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const savePromise = queueHarvestRecord(record);
      toast.promise(savePromise, {
        loading: "Saving harvest record on this device",
        success: {
          message: "Harvest saved on this device",
          description:
            "It will sync automatically when a connection is available.",
        },
        error: {
          message: "Unable to save harvest",
          description: "Please try again. Your record has not been queued.",
        },
      });
      await savePromise;

      setIsOpen(false);
      await loadTodayHarvest();
      return true;
    } catch (error) {
      console.error("Failed to save harvest record:", error);
      setErrorMessage("Unable to save the harvest record. Please try again.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  function closeDialog() {
    if (isSubmitting) return;
    setIsOpen(false);
    setErrorMessage(null);
  }

  return (
    <>
      <Button
        className="flex-1 flex flex-col w-full rounded-lg h-full gap-4"
        size={"icon-lg"}
        variant="outline"
        onClick={() => {
          setErrorMessage(null);
          setIsOpen(true);
        }}
      >
        <span className="flex flex-col gap-2 items-center">
          <HugeiconsIcon
            icon={ShoppingBasket01Icon}
            size={58}
            className="size-10"
            strokeWidth={2}
          />
          <span className="text-start text-4xl font-semibold tracking-tight sm:text-5xl">
            Record
            <br />
            Harvest
          </span>
        </span>
        <div className="flex flex-col gap-2">
          <Badge variant="outline">Today's Harvest</Badge>
          <p className="text-2xl font-semibold" aria-live="polite">
            {isLoadingHarvest
              ? "Loading..."
              : harvestLoadFailed
                ? "Unavailable"
                : `${formatQuantity.format(todayHarvestTotal ?? 0)} kg`}
          </p>
        </div>
      </Button>
      <RecordHarvestDialog
        open={isOpen}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        onClose={closeDialog}
        onRecord={submitHarvest}
      />
    </>
  );
}
