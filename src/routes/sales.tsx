import { useEffect, useState, type FormEvent } from "react";
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { RecordedByField } from "@/components/recorded-by-field";
import { OptionItem } from "@/components/sales/option-item";
import { SaleItem } from "@/components/sales/sale-item";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  OYSTER_MUSHROOM_SALE_OPTIONS,
  type SaleDraft,
  type SaleItemDraft,
} from "@/lib/sales-data";
import { cacheProduct, getCachedProduct } from "@/lib/offline";
import { queueSaleRecord } from "@/lib/offline-sync";
import type { Tables } from "@/lib/supabase/database.types";

type OysterMushroomProduct = Pick<
  Tables<"products">,
  "id" | "default_price" | "name" | "unit"
>;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);

const formatQuantity = (quantity: number) =>
  new Intl.NumberFormat("en-PH", {
    maximumSignificantDigits: 4,
  }).format(quantity);

const currentTimestamp = () => new Date().toISOString();

function SalesRoute() {
  const navigate = useNavigate();
  const [product, setProduct] = useState<OysterMushroomProduct | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [productLoadError, setProductLoadError] = useState<string | null>(null);
  const [productLoadAttempt, setProductLoadAttempt] = useState(0);
  const [items, setItems] = useState<SaleItemDraft[]>([]);
  const [recordedBy, setRecordedBy] = useState("");
  const [recordedByError, setRecordedByError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [customMode, setCustomMode] = useState<"weight" | "amount" | null>(
    null,
  );
  const [customValue, setCustomValue] = useState("");
  const [receipt, setReceipt] = useState<SaleDraft | null>(null);

  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
  const options = product ? OYSTER_MUSHROOM_SALE_OPTIONS(product) : [];

  useEffect(() => {
    let isCurrent = true;

    async function loadProduct() {
      setIsLoadingProduct(true);
      setProductLoadError(null);
      setProduct(null);

      try {
        const productPromise = (async () => {
          try {
            const { supabase } = await import("@/lib/supabase/client");
            const { data: productData, error } = await supabase
              .from("products")
              .select("id, name, default_price, unit, is_active")
              .eq("id", 1)
              .maybeSingle();

            if (error) throw error;
            if (!productData)
              throw new Error("Oyster Mushroom product (id: 1) not found.");
            if (productData.is_active === false) {
              throw new Error("Oyster Mushroom product (id: 1) is inactive.");
            }
            if (
              !Number.isFinite(productData.default_price) ||
              productData.default_price <= 0
            ) {
              throw new Error(
                "Oyster Mushroom product has an invalid default price.",
              );
            }

            try {
              await cacheProduct(productData);
            } catch (cacheError) {
              console.error(
                "Unable to cache Oyster Mushroom pricing:",
                cacheError,
              );
            }

            return { product: productData, isCached: false };
          } catch (error) {
            if (navigator.onLine && !(error instanceof TypeError)) throw error;

            const cachedProduct = await getCachedProduct(1);
            if (!cachedProduct) throw error;
            if (cachedProduct.is_active === false) {
              throw new Error("Cached Oyster Mushroom product is inactive.");
            }
            if (
              !Number.isFinite(cachedProduct.default_price) ||
              cachedProduct.default_price <= 0
            ) {
              throw new Error("Cached Oyster Mushroom price is invalid.");
            }

            return { product: cachedProduct, isCached: true };
          }
        })();
        /* toast.promise(productPromise, {
          loading: "Loading sales options",
          success: (result) =>
            result.isCached
              ? { message: "Using saved sales pricing" }
              : { message: "Sales options ready" },
          error: {
            message: "Unable to load sales options",
          },
        }); */
        const { product: data } = await productPromise;

        if (isCurrent) setProduct(data);
      } catch (error) {
        console.error("Failed to load Oyster Mushroom product:", error);
        if (isCurrent) {
          setProductLoadError(
            "Unable to load Oyster Mushroom pricing. Please try again.",
          );
        }
      } finally {
        if (isCurrent) setIsLoadingProduct(false);
      }
    }

    void loadProduct();
    return () => {
      isCurrent = false;
    };
  }, [productLoadAttempt]);

  function updateItemCount(id: string, optionCount: number) {
    if (!Number.isInteger(optionCount) || optionCount < 1) return;
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              optionCount,
              optionCountLabel: String(optionCount),
              subtotal: item.pricePerOption * optionCount,
            }
          : item,
      ),
    );
  }

  function handleQuantityChange(id: string, value: string) {
    if (value === "") {
      setItems((current) =>
        current.map((item) =>
          item.id === id ? { ...item, optionCountLabel: "" } : item,
        ),
      );
      return;
    }

    const optionCount = Number(value);
    if (Number.isInteger(optionCount) && optionCount > 0) {
      updateItemCount(id, optionCount);
    }
  }

  function handleOptionCountBlur(id: string) {
    setItems((current) =>
      current.map((item) =>
        item.id === id && !item.optionCountLabel
          ? { ...item, optionCountLabel: String(item.optionCount) }
          : item,
      ),
    );
  }

  function changeOptionCount(option: (typeof options)[number], change: 1 | -1) {
    if (!product) return;

    setItems((current) => {
      const existing = current.find((item) => item.optionId === option.id);
      if (!existing) {
        if (change < 0) return current;
        return [
          ...current,
          {
            id: crypto.randomUUID(),
            optionId: option.id,
            name: option.itemLabel,
            detail: `${formatCurrency(product.default_price)} / ${product.unit}`,
            optionCount: 1,
            optionCountLabel: "1",
            productQuantityPerOption: option.quantity,
            pricePerOption: option.amount,
            subtotal: option.amount,
          },
        ];
      }

      const optionCount = existing.optionCount + change;
      if (optionCount < 1) {
        return current.filter((item) => item.id !== existing.id);
      }

      return current.map((item) =>
        item.id === existing.id
          ? {
              ...item,
              optionCount,
              optionCountLabel: String(optionCount),
              subtotal: item.pricePerOption * optionCount,
            }
          : item,
      );
    });
  }

  function addCustomItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(customValue);
    if (!Number.isFinite(value) || value <= 0 || !customMode || !product) {
      return;
    }

    const isWeight = customMode === "weight";
    const productQuantityPerOption = isWeight
      ? value
      : value / product.default_price;
    const pricePerOption = isWeight ? value * product.default_price : value;
    const productUnitPrice = product.default_price;
    setItems((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: `${formatQuantity(productQuantityPerOption)}${product.unit} ${product.name}`,
        detail: `${formatCurrency(productUnitPrice)} / ${product.unit}`,
        optionCount: 1,
        optionCountLabel: "1",
        productQuantityPerOption,
        pricePerOption,
        subtotal: pricePerOption,
      },
    ]);
    setCustomValue("");
    setCustomMode(null);
  }

  async function confirmSale() {
    const trimmedRecordedBy = recordedBy.trim();
    const hasRecordedByError = !trimmedRecordedBy;
    const hasItemsError = items.length === 0;

    setRecordedByError(
      hasRecordedByError
        ? "Enter the name of the person recording this sale."
        : null,
    );
    setSubmitError(
      hasItemsError ? "Add at least one item before submitting." : null,
    );

    if (hasRecordedByError || hasItemsError) return;
    if (!product) {
      setSubmitError(
        "Product details are not available. Please retry loading.",
      );
      return;
    }

    setIsSaving(true);
    try {
      const salePromise = queueSaleRecord({
        recordedBy: trimmedRecordedBy,
        productId: product.id,
        items,
      });
      toast.promise(salePromise, {
        loading: "Saving sale on this device",
        success: {
          message: "Sale saved on this device",
          description:
            "It will sync automatically when a connection is available.",
        },
        error: {
          message: "Unable to save sale",
          description: "Please try again. Your sale has not been queued.",
        },
      });
      await salePromise;

      setReceipt({
        id: null,
        recordedBy: trimmedRecordedBy,
        recordedAt: currentTimestamp(),
        items,
        totalAmount,
      });
      setSubmitError(null);
    } catch (error) {
      console.error("Failed to save sale:", error);
      setSubmitError(
        "Unable to save the sale. Make sure you are signed in and try again.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function startNewSale() {
    setItems([]);
    setReceipt(null);
    setCustomMode(null);
    setCustomValue("");
  }

  function renderSaleItems() {
    return (
      <>
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <SaleItem
              key={item.id}
              item={item}
              onQuantityChange={handleQuantityChange}
              onQuantityBlur={handleOptionCountBlur}
              onDecrement={(id) => {
                const currentItem = items.find((entry) => entry.id === id);
                if (currentItem) {
                  if (currentItem.optionCount === 1) {
                    setItems((current) =>
                      current.filter((entry) => entry.id !== id),
                    );
                  } else {
                    updateItemCount(id, currentItem.optionCount - 1);
                  }
                }
              }}
              onIncrement={(id) => {
                const currentItem = items.find((entry) => entry.id === id);
                if (currentItem) {
                  updateItemCount(id, currentItem.optionCount + 1);
                }
              }}
            />
          ))}
        </div>
        {items.length === 0 && (
          <p className="rounded-xl bg-card/60 px-4 py-6 text-center text-sm text-primary/70">
            Choose an option to add items to this sale.
          </p>
        )}
      </>
    );
  }

  return (
    <>
      <main className="grid min-h-[calc(100dvh-72px)] gap-6 px-5 py-6 grid-rows-[1fr_auto] lg:grid-rows-[1fr] lg:grid-cols-[1fr_1fr] lg:gap-10 lg:px-8 lg:py-7">
        <section
          className="flex min-h-[560px] flex-col min-w-1"
          aria-labelledby="sales-heading"
        >
          <div>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {isLoadingProduct && (
                <p
                  role="status"
                  className="col-span-full text-sm text-muted-foreground"
                >
                  Loading Oyster Mushroom pricing…
                </p>
              )}
              {productLoadError && (
                <div className="col-span-full space-y-2" role="alert">
                  <p className="text-sm text-destructive">{productLoadError}</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setProductLoadAttempt((attempt) => attempt + 1)
                    }
                  >
                    Retry
                  </Button>
                </div>
              )}
              {product &&
                !isLoadingProduct &&
                !productLoadError &&
                options.map((option) => (
                  <OptionItem
                    key={option.id}
                    label={option.label}
                    subtitle={option.subtitle}
                    quantity={
                      items.find((item) => item.optionId === option.id)
                        ?.optionCount ?? 0
                    }
                    onDecrement={() => changeOptionCount(option, -1)}
                    onIncrement={() => changeOptionCount(option, 1)}
                  />
                ))}
              {product && !isLoadingProduct && !productLoadError && (
                <>
                  <OptionItem
                    custom
                    label={
                      <>
                        Custom
                        <br />
                        Amount
                      </>
                    }
                    onSelect={() => {
                      setCustomMode("amount");
                      setCustomValue("");
                    }}
                  />
                  <OptionItem
                    custom
                    label={
                      <>
                        Custom
                        <br />
                        Weight
                      </>
                    }
                    onSelect={() => {
                      setCustomMode("weight");
                      setCustomValue("");
                    }}
                  />
                </>
              )}
            </div>

            {customMode && (
              <form
                onSubmit={addCustomItem}
                className="mt-4 flex max-w-[500px] flex-wrap items-end gap-3 rounded-xl border border-primary/20 bg-card p-4"
              >
                <label className="min-w-40 flex-1 text-sm font-medium text-primary">
                  {customMode === "weight"
                    ? `Custom weight (${product?.unit ?? "kg"})`
                    : "Custom amount (₱)"}
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
        </section>

        <Drawer swipeDirection="right">
          <DrawerTrigger
            type="button"
            className="h-[58px] w-full rounded-2xl text-base font-semibold bg-primary text-background lg:hidden"
          >
            Show Items{" "}
            <span className="text-sm font-thin sm:text-base">
              ({items.length})
            </span>
          </DrawerTrigger>
          <section
            aria-labelledby="items-heading"
            className=" min-w-1 flex-col rounded-xl bg-muted p-5 sm:p-6 hidden lg:flex"
          >
            <div className="flex items-center justify-between gap-4">
              <h2
                id="items-heading"
                className="text-2xl font-semibold text-primary"
              >
                Items
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-secondary-foreground sm:text-base">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
              </div>
            </div>
            <div className="mt-4 hidden min-h-0 flex-1 flex-col overflow-y-auto lg:flex">
              {renderSaleItems()}
            </div>
            <div className="mt-auto flex items-center justify-between gap-4 border-t border-primary/70 pt-5 text-primary lg:mt-5">
              <span className="text-2xl font-semibold sm:text-3xl">Total</span>
              <span className="text-4xl font-bold tabular-nums sm:text-5xl">
                {formatCurrency(totalAmount)}
              </span>
            </div>
            {submitError && (
              <p
                role="alert"
                className="mt-3 text-sm font-medium text-destructive"
              >
                {submitError}
              </p>
            )}
            <RecordedByField
              value={recordedBy}
              onChange={(value) => {
                setRecordedBy(value);
                if (value.trim()) setRecordedByError(null);
              }}
              placeholder="Enter your name"
              className="mt-auto pt-8"
              error={recordedByError}
            />
            <div className="mt-4 grid grid-cols-[0.8fr_1.2fr] gap-3">
              <Button
                type="button"
                variant="secondary"
                className="h-[58px] rounded-2xl bg-accent text-base font-semibold text-primary hover:bg-accent/50"
                onClick={() => setItems([])}
              >
                Clear
              </Button>
              <Button
                type="button"
                disabled={isSaving}
                className="h-[58px] rounded-2xl text-base font-semibold"
                onClick={confirmSale}
              >
                {isSaving ? "Saving..." : "Submit Sale"}
              </Button>
            </div>
          </section>
          <DrawerContent className="w-[calc(100%-1rem)] bg-background">
            <DrawerHeader>
              <DrawerTitle>
                {/* Sale items */}
                <div className="flex items-center justify-between gap-4">
                  <h2
                    id="items-heading"
                    className="text-lg font-semibold text-primary"
                  >
                    Items{" "}
                    <span className="text-sm text-secondary-foreground sm:text-base">
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </span>
                  </h2>
                  <DrawerClose className="bg-secondary rounded-full p-1.5">
                    <HugeiconsIcon icon={Cancel01Icon} size={16} />
                  </DrawerClose>
                </div>
              </DrawerTitle>
            </DrawerHeader>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 pt-3">
              {renderSaleItems()}
            </div>
            <DrawerFooter className="gap-3">
              <div className="mt-auto flex items-center justify-between gap-4 border-t border-primary/70 pt-3 text-primary lg:mt-5">
                <span className="text-2xl font-semibold sm:text-3xl">
                  Total
                </span>
                <span className="text-4xl font-bold tabular-nums sm:text-5xl">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              {submitError && (
                <p
                  role="alert"
                  className="mt-3 text-sm font-medium text-destructive"
                >
                  {submitError}
                </p>
              )}
              <RecordedByField
                value={recordedBy}
                onChange={(value) => {
                  setRecordedBy(value);
                  if (value.trim()) setRecordedByError(null);
                }}
                placeholder="Enter your name"
                error={recordedByError}
              />
              <div className="grid grid-cols-[0.8fr_1.2fr] gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="h-[58px] rounded-2xl bg-accent text-base font-semibold text-primary hover:bg-accent/50"
                  onClick={() => navigate({ to: "/" })}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={isSaving}
                  className="h-[58px] rounded-2xl text-base font-semibold"
                  onClick={confirmSale}
                >
                  {isSaving ? "Saving..." : "Submit Sale"}
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
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
                Sale saved
              </h2>
              <p className="mt-1 text-base text-muted-foreground">
                {receipt.items.length}{" "}
                {receipt.items.length === 1 ? "item" : "items"} saved on this
                device and queued to sync.
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
                  {formatCurrency(receipt.totalAmount)}
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
                    <span>{item.optionCount}</span>
                    <span>{formatCurrency(item.subtotal)}</span>
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
    </>
  );
}

export default SalesRoute;
