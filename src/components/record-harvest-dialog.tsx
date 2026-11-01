import { useState } from "react";
import { Button } from "@/components/ui/button";

type RecordHarvestDialogProps = {
  open: boolean;
  crop: string;
  onClose: () => void;
  onRecord: (weight: number) => void;
};

export function RecordHarvestDialog({
  open,
  crop,
  onClose,
  onRecord,
}: RecordHarvestDialogProps) {
  const [weight, setWeight] = useState("");

  if (!open) return null;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedWeight = Number(weight);
    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) return;
    onRecord(parsedWeight);
    setWeight("");
  }

  return (
    <div
      className="fixed inset-0 z-30 grid place-items-center bg-foreground/35 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-heading"
        className="w-full max-w-md rounded-xl border bg-card p-6 shadow-xl"
      >
        <h2 id="record-heading" className="text-xl font-semibold">
          Record a harvest
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add today’s {crop.toLowerCase()} yield.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <label className="block text-sm font-medium">
            Weight (kg)
            <input
              autoFocus
              required
              min="0.01"
              step="0.01"
              type="number"
              inputMode="decimal"
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              placeholder="e.g. 2.35"
              className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-base outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save harvest</Button>
          </div>
        </form>
      </section>
    </div>
  );
}
