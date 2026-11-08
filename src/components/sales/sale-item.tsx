import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { SaleItemDraft } from "@/lib/sales-data";

type SaleItemProps = {
  item: SaleItemDraft;
  onQuantityChange: (id: string, value: string) => void;
  onQuantityBlur: (id: string) => void;
  onDecrement: (id: string) => void;
  onIncrement: (id: string) => void;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);

export function SaleItem({
  item,
  onQuantityChange,
  onQuantityBlur,
  onDecrement,
  onIncrement,
}: SaleItemProps) {
  return (
    <article className="grid min-h-[82px] grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 border-b border-border/70 py-3 text-primary last:border-b-0 sm:gap-5">
      <div className="min-w-0">
        <h3 className="truncate text-base leading-tight font-semibold sm:text-lg">
          {item.name}
        </h3>
        <p className="mt-2 inline-flex rounded-full bg-background/80 px-2.5 py-1 text-xs font-medium text-muted-foreground sm:text-sm">
          {item.detail}
        </p>
      </div>
      <div className="inline-flex shrink-0 items-center overflow-hidden rounded-md bg-background/80">
        <button
          type="button"
          onClick={() => onDecrement(item.id)}
          aria-label={`Decrease quantity of ${item.name}`}
          className="grid size-8 place-items-center text-primary transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:size-9"
        >
          <HugeiconsIcon icon={MinusSignIcon} size={18} aria-hidden="true" />
        </button>
        <input
          type="number"
          min="1"
          step="1"
          inputMode="numeric"
          aria-label={`Quantity of ${item.name}`}
          value={item.optionCountLabel}
          onChange={(event) => onQuantityChange(item.id, event.target.value)}
          onBlur={() => onQuantityBlur(item.id)}
          className="h-8 w-8 border-x border-border/70 bg-transparent text-center text-sm font-medium text-primary outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 sm:w-9"
        />
        <button
          type="button"
          onClick={() => onIncrement(item.id)}
          aria-label={`Increase quantity of ${item.name}`}
          className="grid size-8 place-items-center text-primary transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:size-9"
        >
          <HugeiconsIcon icon={PlusSignIcon} size={18} aria-hidden="true" />
        </button>
      </div>
      <span className="min-w-[78px] text-right text-base font-semibold tabular-nums sm:min-w-[112px] sm:text-xl">
        {formatCurrency(item.subtotal)}
      </span>
    </article>
  );
}
