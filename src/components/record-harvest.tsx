import { useState } from "react";
import { ShoppingBasket01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";
import { RecordHarvestDialog } from "@/components/record-harvest-dialog";
import { queueHarvestRecord } from "@/lib/offline-sync";
import type { HarvestRecordDraft } from "@/lib/harvest-data";

export function RecordHarvest() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      <button
        type="button"
        onClick={() => {
          setErrorMessage(null);
          setIsOpen(true);
        }}
        className="group flex min-h-[42vh] flex-col items-center justify-center gap-4 bg-accent px-6 py-10 text-primary transition-colors hover:bg-accent/90 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-primary sm:min-h-0"
      >
        <HugeiconsIcon
          icon={ShoppingBasket01Icon}
          size={58}
          strokeWidth={2.2}
        />
        <span className="max-w-[9ch] text-center text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl">
          Record
          <br />
          Harvest
        </span>
      </button>
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
