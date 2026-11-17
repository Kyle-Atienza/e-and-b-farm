import { RecordedByField } from "@/components/recorded-by-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { HARVEST_PERIOD_OPTIONS, type HarvestPeriod } from "@/lib/harvest-data";
import { Edit04Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

export type HarvestRecord = {
  id: string;
  quantity: number;
  harvest_period: HarvestPeriod | null;
  recorded_by: string | null;
};

export type HarvestRecordUpdate = {
  quantity: number;
  harvest_period: HarvestPeriod;
  recorded_by: string;
};

export default function EditHarvestRecordDialog({
  record,
  onSave,
}: {
  record: HarvestRecord;
  onSave: (values: HarvestRecordUpdate) => Promise<boolean>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(String(record.quantity));
  const [harvestPeriod, setHarvestPeriod] = useState<HarvestPeriod | "">(
    record.harvest_period ?? "",
  );
  const [recordedBy, setRecordedBy] = useState(record.recorded_by ?? "");
  const [isSaving, setIsSaving] = useState(false);

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (open) {
      setQuantity(String(record.quantity));
      setHarvestPeriod(record.harvest_period ?? "");
      setRecordedBy(record.recorded_by ?? "");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedQuantity = Number(quantity);
    const trimmedRecorder = recordedBy.trim();

    if (
      !Number.isFinite(parsedQuantity) ||
      parsedQuantity <= 0 ||
      !harvestPeriod ||
      !trimmedRecorder
    ) {
      toast.error("Enter a valid quantity, period, and recorder name.");
      return;
    }

    setIsSaving(true);
    try {
      const saved = await onSave({
        quantity: parsedQuantity,
        harvest_period: harvestPeriod,
        recorded_by: trimmedRecorder,
      });
      if (saved) setIsOpen(false);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label="Edit harvest record"
        >
          <HugeiconsIcon icon={Edit04Icon} data-icon="inline-start" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit harvest record</DialogTitle>
          <DialogDescription>
            Update the quantity, harvest period, or recorder.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor={`quantity-${record.id}`}>
                Quantity (kg)
              </FieldLabel>
              <Input
                id={`quantity-${record.id}`}
                required
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                disabled={isSaving}
              />
            </Field>
            <RecordedByField
              value={recordedBy}
              onChange={setRecordedBy}
              placeholder="Enter recorder name"
              disabled={isSaving}
            />
            <fieldset className="text-sm font-medium text-primary">
              <legend>Harvest period</legend>
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
                      name={`harvest-period-${record.id}`}
                      value={option.value}
                      checked={harvestPeriod === option.value}
                      onChange={() => setHarvestPeriod(option.value)}
                      disabled={isSaving}
                      className="peer sr-only"
                    />
                    <span className="flex h-12 items-center justify-center rounded-full border border-primary/40 bg-card px-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-[3px] peer-focus-visible:ring-primary/30">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
