import { useState, type FormEvent } from "react";
import {
  Calendar01Icon,
  Cancel01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { RecordedByField } from "@/components/recorded-by-field";
import { Button } from "@/components/ui/button";
import type { HarvestPeriod, HarvestRecordDraft } from "@/lib/harvest-data";
import { HARVEST_PERIOD_OPTIONS } from "@/lib/harvest-data";

type RecordHarvestDialogProps = {
  open: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onRecord: (record: HarvestRecordDraft) => Promise<boolean>;
};

const fieldClassName =
  "h-[52px] w-full rounded-2xl border border-primary bg-card pl-12 pr-4 text-base text-primary outline-none placeholder:text-primary/50 focus-visible:ring-[3px] focus-visible:ring-primary/25";

export function RecordHarvestDialog({
  open,
  isSubmitting,
  errorMessage,
  onClose,
  onRecord,
}: RecordHarvestDialogProps) {
  const [harvestDate, setHarvestDate] = useState("");
  const [harvestPeriod, setHarvestPeriod] = useState<HarvestPeriod | "">("");
  const [recordedBy, setRecordedBy] = useState("");
  const [quantity, setQuantity] = useState("");

  if (!open) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedQuantity = Number(quantity);
    if (
      !Number.isFinite(parsedQuantity) ||
      parsedQuantity <= 0 ||
      !harvestDate ||
      !harvestPeriod ||
      !recordedBy.trim()
    ) {
      return;
    }

    const saved = await onRecord({
      quantity: parsedQuantity,
      harvest_date: harvestDate,
      harvest_period: harvestPeriod,
      recorded_by: recordedBy.trim(),
    });
    if (!saved) return;

    setHarvestDate("");
    setHarvestPeriod("");
    setRecordedBy("");
    setQuantity("");
  }

  return (
    <div
      className="fixed inset-0 z-30 grid place-items-center bg-foreground/45 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onClose();
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
          disabled={isSubmitting}
          aria-label="Close record harvest dialog"
          className="absolute top-0 right-0 mt-3 mr-3 grid size-10 place-items-center rounded-full text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/30 disabled:opacity-50"
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
            <label className="block text-sm font-medium text-primary w-full">
              Date
              <span className="relative mt-2 block">
                <HugeiconsIcon
                  icon={Calendar01Icon}
                  size={21}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary"
                />
                <input
                  autoFocus
                  required
                  type="date"
                  value={harvestDate}
                  onChange={(event) => setHarvestDate(event.target.value)}
                  aria-label="Harvest date"
                  disabled={isSubmitting}
                  className={fieldClassName}
                />
              </span>
            </label>
            <RecordedByField
              value={recordedBy}
              onChange={setRecordedBy}
              placeholder="Enter recorder name"
              disabled={isSubmitting}
            />
          </div>
          <fieldset className="block text-sm font-medium text-primary">
            <legend>Harvest Period</legend>
            <div
              role="radiogroup"
              aria-label="Harvest period"
              className="mt-2 grid grid-cols-3 gap-2"
            >
              {HARVEST_PERIOD_OPTIONS.map((option) => (
                <label key={option.value} className="cursor-pointer">
                  <input
                    required
                    type="radio"
                    name="harvest-period"
                    value={option.value}
                    checked={harvestPeriod === option.value}
                    onChange={() => setHarvestPeriod(option.value)}
                    disabled={isSubmitting}
                    className="peer sr-only"
                  />
                  <span className="flex h-[48px] items-center justify-center rounded-full border border-primary/40 bg-card px-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-[3px] peer-focus-visible:ring-primary/30">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
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
                disabled={isSubmitting}
                className={fieldClassName}
              />
            </span>
          </label>
          {errorMessage && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {errorMessage}
            </p>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 h-[52px] w-full rounded-full bg-accent text-lg font-semibold text-secondary-foreground hover:bg-accent/85"
          >
            {isSubmitting ? "Saving..." : "Submit"}
          </Button>
        </form>
      </section>
    </div>
  );
}
