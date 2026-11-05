import {
  Delete02Icon,
  MinusSignIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { SaleItemDraft } from "@/lib/sales-data";

type SaleItemProps = {
  item: SaleItemDraft;
  onQuantityChange: (id: string, value: string) => void;
  onQuantityBlur: (id: string) => void;
  onDecrement: (id: string) => void;
  onIncrement: (id: string) => void;
  onRemove: (id: string) => void;
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
  onRemove,
}: SaleItemProps) {
  return (
    <article className="flex min-h-[75px] items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 text-primary">
      <div className="min-w-0">
        <h3 className="truncate text-base leading-tight font-semibold sm:text-lg">
          {item.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1 sm:gap-3">
        <button
          type="button"
          onClick={() => onDecrement(item.id)}
          disabled={item.optionCount <= 1}
          aria-label={`Decrease quantity of ${item.name}`}
          className="grid size-8 place-items-center rounded-full border border-primary/25 bg-background text-primary transition-colors hover:bg-background/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-40 sm:size-10"
        >
          <HugeiconsIcon icon={MinusSignIcon} size={18} />
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
          className="h-8 w-10 rounded-full border border-primary/25 bg-background text-center text-sm font-semibold text-primary outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 sm:h-10 sm:w-12"
        />
        <button
          type="button"
          onClick={() => onIncrement(item.id)}
          aria-label={`Increase quantity of ${item.name}`}
          className="grid size-8 place-items-center rounded-full border border-primary/25 bg-background text-primary transition-colors hover:bg-background/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:size-10"
        >
          <HugeiconsIcon icon={PlusSignIcon} size={18} />
        </button>
        <span className="min-w-[62px] text-right text-sm font-semibold tabular-nums sm:min-w-[78px] sm:text-lg">
          {formatCurrency(item.subtotal)}
        </span>
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${item.name}`}
          className="grid size-10 place-items-center rounded-full bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-destructive/30 sm:size-11"
        >
          <HugeiconsIcon icon={Delete02Icon} size={22} />
        </button>
      </div>
    </article>
  );
}
