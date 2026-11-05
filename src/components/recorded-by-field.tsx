import { useId } from "react";
import { UserIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";

const RECORDED_BY_OPTIONS = ["Verelyn", "Bernita", "Edison"];

type RecordedByFieldProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  error?: string | null;
};

export function RecordedByField({
  value,
  onChange,
  disabled = false,
  placeholder = "Enter your name",
  className,
  error,
}: RecordedByFieldProps) {
  const optionsId = `recorded-by-options-${useId()}`;
  const inputId = `recorded-by-${useId()}`;
  const errorId = `${inputId}-error`;

  return (
    <label className={cn("block text-sm font-medium text-primary", className)}>
      Recorded By
      <span className="relative mt-2 block">
        <HugeiconsIcon
          icon={UserIcon}
          size={21}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary"
        />
        <input
          id={inputId}
          required
          list={optionsId}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="h-[52px] w-full rounded-2xl border border-primary bg-card pl-12 pr-4 text-base text-primary outline-none placeholder:text-primary/50 focus-visible:ring-[3px] focus-visible:ring-primary/25 disabled:opacity-50"
        />
        <datalist id={optionsId}>
          {RECORDED_BY_OPTIONS.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </span>
      {error && (
        <span
          id={errorId}
          role="alert"
          className="mt-2 block text-sm text-destructive"
        >
          {error}
        </span>
      )}
    </label>
  );
}
