import type { ReactNode } from "react";
import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";

type OptionItemBaseProps = {
  label: ReactNode;
  subtitle?: string;
  compact?: boolean;
};

type QuantityOptionItemProps = OptionItemBaseProps & {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onSelect?: never;
};

type SelectOptionItemProps = OptionItemBaseProps & {
  onSelect: () => void;
  quantity?: never;
  onIncrement?: never;
  onDecrement?: never;
  custom?: boolean;
};

type OptionItemProps = QuantityOptionItemProps | SelectOptionItemProps;

function OptionItemText({
  label,
  subtitle,
  compact = false,
}: OptionItemBaseProps) {
  return (
    <div>
      <span
        className={
          compact
            ? "block text-[22px] leading-6 font-bold tracking-tight"
            : "block text-3xl leading-none font-bold tracking-tight sm:text-4xl"
        }
      >
        {label}
      </span>
      {subtitle && (
        <span className="mt-2 block text-md font-medium sm:text-base">
          {subtitle}
        </span>
      )}
    </div>
  );
}

export function OptionItem(props: OptionItemProps) {
  if ("quantity" in props) {
    const { label, subtitle, compact, quantity, onIncrement, onDecrement } =
      props;

    return (
      <article
        role="group"
        aria-label={`${typeof label === "string" ? label : "Sale option"}${subtitle ? ` ${subtitle}` : ""}`}
        className={clsx(
          "flex min-h-[150px] flex-col rounded-xl  p-4 text-left text-secondary-foreground transition",
          (quantity || 0) > 0 ? "bg-accent" : "bg-secondary",
        )}
      >
        <OptionItemText label={label} subtitle={subtitle} compact={compact} />
        <div className="mt-auto flex justify-end pt-4">
          <div
            className={clsx(
              "inline-flex items-center overflow-hidden rounded-lg",
              (quantity || 0) > 0
                ? "bg-secondary text-primary"
                : "bg-accent text-primary",
            )}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Decrease ${typeof label === "string" ? label : "option"} quantity`}
              disabled={quantity === 0}
              onClick={onDecrement}
              className="size-10 rounded-none "
            >
              <HugeiconsIcon
                icon={MinusSignIcon}
                size={20}
                aria-hidden="true"
                strokeWidth={5}
              />
            </Button>
            <output
              aria-label="Selected quantity"
              className="min-w-10 border-x border-border px-2 text-center text-base font-semibold tabular-nums "
            >
              {quantity}
            </output>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Increase ${typeof label === "string" ? label : "option"} quantity`}
              onClick={onIncrement}
              className="size-10 rounded-none "
            >
              <HugeiconsIcon
                icon={PlusSignIcon}
                size={20}
                aria-hidden="true"
                strokeWidth={5}
              />
            </Button>
          </div>
        </div>
      </article>
    );
  }

  const { label, subtitle, compact, onSelect } = props;
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex min-h-[150px] flex-col rounded-xl bg-accent p-4 text-left text-secondary-foreground transition-colors hover:bg-accent/80 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary"
    >
      <OptionItemText label={label} subtitle={subtitle} compact={compact} />
    </button>
  );
}
