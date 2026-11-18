import { useState, type FormEvent } from "react";
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
import { Field, FieldLabel, FieldLegend, FieldSet } from "./ui/field";
import { Input } from "./ui/input";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

type RecordHarvestDialogProps = {
  open: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onRecord: (record: HarvestRecordDraft) => Promise<boolean>;
};

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
      <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
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
        <FieldSet>
          <FieldLegend variant="label">Harvest Period</FieldLegend>
          <RadioGroup
            required
            value={harvestPeriod || null}
            onValueChange={(value) => {
              const selectedOption = HARVEST_PERIOD_OPTIONS.find(
                (option) => option.value === value,
              );
              if (selectedOption) setHarvestPeriod(selectedOption.value);
            }}
            className="gap-1"
            disabled={isSubmitting}
          >
            {HARVEST_PERIOD_OPTIONS.map((option) => (
              <Field
                key={option.value}
                orientation="horizontal"
                className="items-center gap-2"
              >
                <RadioGroupItem
                  value={option.value}
                  id={`harvest-period-${option.value.toLowerCase()}`}
                  disabled={isSubmitting}
                />
                <FieldLabel
                  htmlFor={`harvest-period-${option.value.toLowerCase()}`}
                >
                  {option.label}
                </FieldLabel>
              </Field>
            ))}
          </RadioGroup>
        </FieldSet>
        <Field>
          <FieldLabel>Quantity (Weight in kg)</FieldLabel>
          <Input
            type="number"
            step="0.01"
            inputMode="decimal"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            placeholder="Enter harvest quantity"
            disabled={isSubmitting}
          />
        </Field>
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
