import { useState, type FormEvent } from "react";
import { UserIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { RecordedByField } from "@/components/recorded-by-field";
import { Button } from "@/components/ui/button";
import type { HarvestPeriod, HarvestRecordDraft } from "@/lib/harvest-data";
import { HARVEST_PERIOD_OPTIONS } from "@/lib/harvest-data";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Field, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";

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
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Record Harvest</DialogTitle>
        <DialogDescription>
          Enter the harvest details below and submit the record.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="harvest-date">Date</FieldLabel>
            <Input
              id="harvest-date"
              required
              type="date"
              value={harvestDate}
              onChange={(event) => setHarvestDate(event.target.value)}
              aria-label="Harvest date"
              disabled={isSubmitting}
            />
          </Field>
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
        <DialogFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Submit"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
