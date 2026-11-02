import { useState, type FormEvent } from "react";
import {
  CheckmarkCircle02Icon,
  Delete02Icon,
  MinusSignIcon,
  PlusSignIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import {
  SALE_PRESETS,
  type SaleDraft,
  type SaleItemDraft,
} from "@/lib/sales-data";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);

const currentTimestamp = () => new Date().toISOString();

function SalesRoute() {
  const navigate = useNavigate();
  const [items, setItems] = useState<SaleItemDraft[]>([]);
  const [recordedBy, setRecordedBy] = useState("Elena Bautista");
  const [customMode, setCustomMode] = useState<"weight" | "amount" | null>(
    null,
  );
  const [customValue, setCustomValue] = useState("");
  const [receipt, setReceipt] = useState<SaleDraft | null>(null);

  const total = items.reduce((sum, item) => sum + item.total, 0);

  function updateItemQuantity(id: string, quantity: number) {
    if (!Number.isInteger(quantity) || quantity < 1) return;
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity,
              quantityLabel: String(quantity),
              total: item.unitPrice * quantity,
            }
          : item,
      ),
    );
  }

  function addPreset(preset: (typeof SALE_PRESETS)[number]) {
    setItems((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: preset.subtitle === "Oyster Mushroom"
          ? `${preset.title} Oyster Mushroom`
          : preset.subtitle,
        detail: preset.detail,
        quantity: 1,
        quantityLabel: "1",
        unitPrice: preset.total / preset.quantity,
        total: preset.total,
      },
    ]);
  }

  function addCustomItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(customValue);
    if (!Number.isFinite(value) || value <= 0 || !customMode) return;

    const isWeight = customMode === "weight";
    const lineTotal = isWeight ? value * 300 : value;
    setItems((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: isWeight ? `${value}kg Oyster Mushroom` : "Custom Amount",
        detail: isWeight ? "₱300.00 / kg" : "Fixed amount",
        quantity: 1,
        quantityLabel: "1",
        unitPrice: isWeight ? 300 : value,
        total: lineTotal,
      },
    ]);
    setCustomValue("");
    setCustomMode(null);
  }

  function confirmSale() {
    if (!items.length || !recordedBy.trim()) return;
    setReceipt({
      recordedBy: recordedBy.trim(),
      recordedAt: currentTimestamp(),
      items,
      total,
    });
  }

  function startNewSale() {
    setItems([]);
    setReceipt(null);
    setCustomMode(null);
    setCustomValue("");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="grid min-h-[calc(100dvh-72px)] gap-6 px-5 py-6 lg:grid-cols-[1fr_1fr] lg:gap-10 lg:px-8 lg:py-7">
        <section className="flex min-h-[560px] flex-col" aria-labelledby="sales-heading">
          <div>
            <h1
              id="sales-heading"
              className="text-3xl font-semibold tracking-tight text-primary"
            >
              Add Sales
            </h1>
            <p className="mt-1 text-base text-muted-foreground">
              Select a preset, record items, and confirm the sale.
            </p>
            <h2 className="mt-5 text-lg font-semibold text-primary">Presets</h2>
            <div className="mt-2 grid max-w-[500px] grid-cols-2 gap-3 sm:grid-cols-3">
              {SALE_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => addPreset(preset)}
                  className="flex min-h-[108px] flex-col items-center justify-center rounded-xl bg-accent px-3 py-4 text-center text-secondary-foreground transition-colors hover:bg-accent/80 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary"
                >
                  <span className="text-[30px] leading-8 font-bold tracking-tight">
                    {preset.title}
                  </span>
                  <span className="mt-1 text-sm font-medium">
                    {preset.subtitle}
                  </span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setCustomMode("amount");
                  setCustomValue("");
                }}
                className="flex min-h-[108px] flex-col items-center justify-center rounded-xl bg-accent px-3 py-4 text-center text-secondary-foreground transition-colors hover:bg-accent/80 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary"
              >
                <span className="text-[22px] leading-6 font-bold tracking-tight">
                  Custom
                  <br />
                  Amount
                </span>
                <span className="mt-1 text-sm font-medium">Enter any amount</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCustomMode("weight");
                  setCustomValue("");
                }}
                className="flex min-h-[108px] flex-col items-center justify-center rounded-xl bg-accent px-3 py-4 text-center text-secondary-foreground transition-colors hover:bg-accent/80 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary"
              >
                <span className="text-[22px] leading-6 font-bold tracking-tight">
                  Custom
                  <br />
                  Weight
                </span>
                <span className="mt-1 text-sm font-medium">Enter any weight</span>
              </button>
            </div>

            {customMode && (
              <form
                onSubmit={addCustomItem}
                className="mt-4 flex max-w-[500px] flex-wrap items-end gap-3 rounded-xl border border-primary/20 bg-card p-4"
              >
                <label className="min-w-40 flex-1 text-sm font-medium text-primary">
                  {customMode === "weight" ? "Custom weight (kg)" : "Custom amount (₱)"}
                  <input
                    autoFocus
                    required
                    min="0.01"
                    step="0.01"
                    type="number"
                    inputMode="decimal"
                    value={customValue}
                    onChange={(event) => setCustomValue(event.target.value)}
                    className="mt-1 h-11 w-full rounded-lg border border-input bg-background px-3 outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
                  />
                </label>
                <Button type="submit">Add item</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCustomMode(null)}
                >
                  Cancel
                </Button>
              </form>
            )}
          </div>

          <label className="mt-auto block pt-8 text-sm font-medium text-primary">
            Recorded By
            <span className="relative mt-2 block max-w-[300px]">
              <HugeiconsIcon
                icon={UserIcon}
                size={21}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary"
              />
              <input
                required
                type="text"
                value={recordedBy}
                onChange={(event) => setRecordedBy(event.target.value)}
                className="h-[52px] w-full rounded-2xl border border-primary bg-card pl-12 pr-4 text-base text-primary outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
              />
            </span>
          </label>
        </section>

        <section
          aria-labelledby="items-heading"
          className="flex min-h-[420px] flex-col rounded-xl bg-accent p-5 sm:p-6 lg:min-h-[calc(100dvh-128px)]"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 id="items-heading" className="text-xl font-semibold text-primary">
              Items
            </h2>
            <span className="text-sm text-secondary-foreground">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </div>
          <div className="mt-4 flex-1 space-y-3 overflow-y-auto">
            {items.map((item) => (
              <article
                key={item.id}
                className="flex min-h-[75px] items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 text-primary"
              >
                <div className="min-w-0">
                  <h3 className="truncate text-base leading-tight font-semibold sm:text-lg">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1 sm:gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      updateItemQuantity(item.id, item.quantity - 1)
                    }
                    disabled={item.quantity <= 1}
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
                    value={item.quantityLabel}
                    onChange={(event) => {
                      const value = event.target.value;
                      const quantity = Number(value);
                      if (value === "") {
                        setItems((current) =>
                          current.map((entry) =>
                            entry.id === item.id
                              ? { ...entry, quantityLabel: "" }
                              : entry,
                          ),
                        );
                      } else if (Number.isInteger(quantity) && quantity > 0) {
                        updateItemQuantity(item.id, quantity);
                      }
                    }}
                    onBlur={() => {
                      if (!item.quantityLabel) {
                        setItems((current) =>
                          current.map((entry) =>
                            entry.id === item.id
                              ? {
                                  ...entry,
                                  quantityLabel: String(entry.quantity),
                                }
                              : entry,
                          ),
                        );
                      }
                    }}
                    className="h-8 w-10 rounded-full border border-primary/25 bg-background text-center text-sm font-semibold text-primary outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 sm:h-10 sm:w-12"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateItemQuantity(item.id, item.quantity + 1)
                    }
                    aria-label={`Increase quantity of ${item.name}`}
                    className="grid size-8 place-items-center rounded-full border border-primary/25 bg-background text-primary transition-colors hover:bg-background/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:size-10"
                  >
                    <HugeiconsIcon icon={PlusSignIcon} size={18} />
                  </button>
                  <span className="min-w-[62px] text-right text-sm font-semibold tabular-nums sm:min-w-[78px] sm:text-lg">
                    {formatCurrency(item.total)}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setItems((current) =>
                        current.filter((entry) => entry.id !== item.id),
                      )
                    }
                    aria-label={`Remove ${item.name}`}
                    className="grid size-10 place-items-center rounded-full bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-destructive/30 sm:size-11"
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={22} />
                  </button>
                </div>
              </article>
            ))}
            {items.length === 0 && (
              <p className="rounded-xl bg-card/60 px-4 py-6 text-center text-sm text-primary/70">
                Choose a preset to add items to this sale.
              </p>
            )}
          </div>
          <div className="mt-5 flex items-center justify-between gap-4 text-primary">
            <span className="text-xl font-semibold">Total</span>
            <span className="text-3xl font-bold tabular-nums sm:text-4xl">
              {formatCurrency(total)}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-[0.8fr_1.2fr] gap-3">
            <Button
              type="button"
              variant="secondary"
              className="h-[58px] rounded-2xl bg-muted text-base font-semibold text-primary hover:bg-muted/80"
              onClick={() => navigate({ to: "/" })}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!items.length || !recordedBy.trim()}
              className="h-[58px] rounded-2xl text-base font-semibold"
              onClick={confirmSale}
            >
              Confirm Sale
            </Button>
          </div>
        </section>
      </main>

      {receipt && (
        <div
          className="fixed inset-0 z-30 grid place-items-center bg-foreground/30 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setReceipt(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="sale-confirmed-heading"
            className="w-full max-w-[420px] rounded-[20px] bg-card p-6 shadow-2xl sm:p-7"
          >
            <div className="flex flex-col items-center text-center">
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                size={58}
                className="text-primary"
              />
              <h2
                id="sale-confirmed-heading"
                className="mt-2 text-2xl font-bold text-primary"
              >
                Sale recorded
              </h2>
              <p className="mt-1 text-base text-muted-foreground">
                {receipt.items.length}{" "}
                {receipt.items.length === 1 ? "item" : "items"} saved
                successfully
              </p>
            </div>
            <dl className="mt-5 space-y-2 rounded-2xl bg-background p-4 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Recorded by</dt>
                <dd className="text-right font-semibold text-primary">
                  {receipt.recordedBy}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Items</dt>
                <dd className="font-semibold text-primary">
                  {receipt.items.length}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Total</dt>
                <dd className="font-semibold text-primary">
                  {formatCurrency(receipt.total)}
                </dd>
              </div>
            </dl>
            <div className="mt-4 max-h-48 space-y-2 overflow-y-auto">
              {receipt.items.map((item) => (
                <article
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-background px-3 py-3 text-primary"
                >
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.detail}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-sm font-semibold">
                    <span>{item.quantity}</span>
                    <span>{formatCurrency(item.total)}</span>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-[1fr_1fr] gap-3">
              <Button
                type="button"
                variant="secondary"
                className="h-14 rounded-2xl bg-muted text-base font-semibold text-primary hover:bg-muted/80"
                onClick={() => navigate({ to: "/" })}
              >
                Close
              </Button>
              <Button
                type="button"
                className="h-14 rounded-2xl text-base font-semibold"
                onClick={startNewSale}
              >
                New Sale
              </Button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default SalesRoute;
