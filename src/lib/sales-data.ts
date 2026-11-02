export type SaleItemDraft = {
  id: string;
  name: string;
  detail: string;
  quantity: number;
  quantityLabel: string;
  unitPrice: number;
  total: number;
};

export type SaleDraft = {
  recordedBy: string;
  recordedAt: string;
  items: SaleItemDraft[];
  total: number;
};

export type SalePreset = {
  id: string;
  title: string;
  subtitle: string;
  quantity: number;
  total: number;
  detail: string;
};

export const SALE_PRESETS: SalePreset[] = [
  {
    id: "weight-1kg",
    title: "1kg",
    subtitle: "Oyster Mushroom",
    quantity: 1,
    total: 300,
    detail: "₱300.00 / kg",
  },
  {
    id: "weight-half-kg",
    title: "1/2kg",
    subtitle: "Oyster Mushroom",
    quantity: 0.5,
    total: 150,
    detail: "₱300.00 / kg",
  },
  {
    id: "weight-quarter-kg",
    title: "1/4kg",
    subtitle: "Oyster Mushroom",
    quantity: 0.25,
    total: 75,
    detail: "₱300.00 / kg",
  },
  {
    id: "amount-100",
    title: "₱100",
    subtitle: "Fixed amount",
    quantity: 1,
    total: 100,
    detail: "Fixed amount",
  },
  {
    id: "amount-50",
    title: "₱50",
    subtitle: "Fixed amount",
    quantity: 1,
    total: 50,
    detail: "Fixed amount",
  },
];
