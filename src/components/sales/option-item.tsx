import type { ReactNode } from "react";

type OptionItemProps = {
  label: ReactNode;
  subtitle?: string;
  compact?: boolean;
  onSelect: () => void;
};

export function OptionItem({
  label,
  subtitle,
  compact = false,
  onSelect,
}: OptionItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex min-h-[108px] flex-col items-center justify-center rounded-xl bg-accent px-3 py-4 text-center text-secondary-foreground transition-colors hover:bg-accent/80 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary"
    >
      <span
        className={
          compact
            ? "text-[22px] leading-6 font-bold tracking-tight"
            : "text-[30px] leading-8 font-bold tracking-tight"
        }
      >
        {label}
      </span>
      {subtitle && (
        <span className="mt-1 text-sm font-medium">{subtitle}</span>
      )}
    </button>
  );
}
