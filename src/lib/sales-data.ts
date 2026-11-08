import type { Tables, TablesInsert } from "@/lib/supabase/database.types";

export type SaleItemDraft = {
  id: string;
  optionId?: string;
  name: string;
  detail: string;
  optionCount: number;
  optionCountLabel: string;
  productQuantityPerOption: number;
  pricePerOption: number;
  subtotal: number;
};

export type SaleDraft = {
  id: number;
  recordedBy: string;
  recordedAt: string;
  items: SaleItemDraft[];
  totalAmount: number;
};

export function toSaleItemInsertValues(
  item: SaleItemDraft,
): Pick<TablesInsert<"sale_item">, "quantity" | "subtotal"> {
  return {
    quantity: item.productQuantityPerOption * item.optionCount,
    subtotal: item.subtotal,
  };
}

export type SaleOption = {
  id: string;
  label: string;
  subtitle: string;
  itemLabel: string;
  quantity: number;
  amount: number;
  isFixedAmount?: boolean;
};

type OysterMushroomProduct = Pick<
  Tables<"products">,
  "default_price" | "name" | "unit"
>;

export const OYSTER_MUSHROOM_SALE_OPTIONS = (
  product: OysterMushroomProduct,
): SaleOption[] => {
  const pricePerUnit = product.default_price;
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  return [
    {
      id: "weight-1-unit",
      label: `1${product.unit}`,
      subtitle: formatCurrency(pricePerUnit),
      itemLabel: `1${product.unit} ${product.name}`,
      quantity: 1,
      amount: pricePerUnit,
    },
    {
      id: "weight-half-unit",
      label: `1/2${product.unit}`,
      subtitle: formatCurrency(pricePerUnit * 0.5),
      itemLabel: `1/2${product.unit} ${product.name}`,
      quantity: 0.5,
      amount: pricePerUnit * 0.5,
    },
    {
      id: "weight-quarter-unit",
      label: `1/4${product.unit}`,
      subtitle: formatCurrency(pricePerUnit * 0.25),
      itemLabel: `1/4${product.unit} ${product.name}`,
      quantity: 0.25,
      amount: pricePerUnit * 0.25,
    },
    /* {
      id: "amount-100",
      label: formatCurrency(100),
      subtitle: `${formatProductQuantity(100 / pricePerUnit)}${product.unit}`,
      itemLabel: `${formatProductQuantity(100 / pricePerUnit)}${product.unit} ${product.name}`,
      quantity: 100 / pricePerUnit,
      amount: 100,
      isFixedAmount: true,
    },
    {
      id: "amount-50",
      label: formatCurrency(50),
      subtitle: `${formatProductQuantity(50 / pricePerUnit)}${product.unit}`,
      itemLabel: `${formatProductQuantity(50 / pricePerUnit)}${product.unit} ${product.name}`,
      quantity: 50 / pricePerUnit,
      amount: 50,
      isFixedAmount: true,
    } */
  ];
};
