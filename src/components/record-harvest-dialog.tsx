import { useState, type FormEvent } from "react";
import {
  Calendar01Icon,
  Cancel01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import type { HarvestRecordDraft } from "@/lib/harvest-data";

type RecordHarvestDialogProps = {
  open: boolean;
  onClose: () => void;
  onRecord: (record: HarvestRecordDraft) => void;
};

const fieldClassName =
  "h-[52px] w-full rounded-2xl border border-primary bg-card pl-12 pr-4 text-base text-primary outline-none placeholder:text-primary/50 focus-visible:ring-[3px] focus-visible:ring-primary/25";

export function RecordHarvestDialog({
  open,
  onClose,
  onRecord,
}: RecordHarvestDialogProps) {
  const [recordedAt, setRecordedAt] = useState("");
  const [recordedBy, setRecordedBy] = useState("");
  const [quantity, setQuantity] = useState("");

  if (!open) return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedQuantity = Number(quantity);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) return;

    onRecord({
      crop: "Oyster Mushroom",
      quantity: parsedQuantity,
      recordedAt: new Date(recordedAt).toISOString(),
      recordedBy: recordedBy.trim(),
    });
    setRecordedAt("");
    setRecordedBy("");
    setQuantity("");
  }

  return (
    <div
      className="fixed inset-0 z-30 grid place-items-center bg-foreground/45 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-heading"
        className="w-full max-w-[520px] rounded-[26px] border border-primary bg-background p-6 shadow-2xl sm:p-8 relative"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close record harvest dialog"
          className="absolute top-0 right-0 mt-3 mr-3 grid size-10 place-items-center rounded-full text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/30"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={24} />
        </button>
        <h2
          id="record-heading"
          className="text-3xl leading-tight font-semibold tracking-tight text-primary"
        >
          Record Harvest
        </h2>
        <p className="mt-1 text-base text-muted-foreground">
          Enter the harvest details below and submit the record.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-primary">
              Date / Time
              <span className="relative mt-2 block">
                <HugeiconsIcon
                  icon={Calendar01Icon}
                  size={21}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary"
                />
                <input
                  autoFocus
                  required
                  type="datetime-local"
                  value={recordedAt}
                  onChange={(event) => setRecordedAt(event.target.value)}
                  aria-label="Date and time"
                  className={fieldClassName}
                />
              </span>
            </label>
            <label className="block text-sm font-medium text-primary">
              Recorded By
              <span className="relative mt-2 block">
                <HugeiconsIcon
                  icon={UserIcon}
                  size={21}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary"
                />
                <input
                  required
                  type="text"
                  value={recordedBy}
                  onChange={(event) => setRecordedBy(event.target.value)}
                  placeholder="Enter recorder name"
                  className={fieldClassName}
                />
              </span>
            </label>
          </div>
          <label className="block text-sm font-medium text-primary">
            Weight (kg)
            <span className="relative mt-2 block">
              <HugeiconsIcon
                icon={UserIcon}
                size={21}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary"
              />
              <input
                required
                min="0.01"
                step="0.01"
                type="number"
                inputMode="decimal"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                placeholder="Enter harvest quantity"
                className={fieldClassName}
              />
            </span>
          </label>
          <Button
            type="submit"
            className="mt-2 h-[52px] w-full rounded-full bg-accent text-lg font-semibold text-secondary-foreground hover:bg-accent/85"
          >
            Submit
          </Button>
        </form>
      </section>
    </div>
  );
}
