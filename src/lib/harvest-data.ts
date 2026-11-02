export type Harvest = {
  id: number;
  crop: string;
  weight: number;
  time: string;
  date: string;
};

export type HarvestRecordDraft = {
  crop: string;
  quantity: number;
  recordedAt: string;
  recordedBy: string;
};

export const CROPS = ["Oyster Mushroom"];

export const INITIAL_HARVESTS: Harvest[] = [
  {
    id: 1,
    crop: "Oyster Mushroom",
    weight: 2.35,
    time: "8:00 AM",
    date: "Today",
  },
  {
    id: 2,
    crop: "Oyster Mushroom",
    weight: 2.35,
    time: "8:00 AM",
    date: "Today",
  },
  {
    id: 3,
    crop: "Oyster Mushroom",
    weight: 2.35,
    time: "8:00 AM",
    date: "Today",
  },
  {
    id: 4,
    crop: "Oyster Mushroom",
    weight: 2.35,
    time: "8:00 AM",
    date: "Today",
  },
  {
    id: 5,
    crop: "Oyster Mushroom",
    weight: 2.35,
    time: "8:00 AM",
    date: "Today",
  },
  {
    id: 6,
    crop: "Oyster Mushroom",
    weight: 2.35,
    time: "8:00 AM",
    date: "Today",
  },
  {
    id: 7,
    crop: "Shiitake Mushroom",
    weight: 1.8,
    time: "10:30 AM",
    date: "Yesterday",
  },
  {
    id: 8,
    crop: "Lion's Mane",
    weight: 1.25,
    time: "2:15 PM",
    date: "Yesterday",
  },
  {
    id: 9,
    crop: "Oyster Mushroom",
    weight: 3.1,
    time: "9:15 AM",
    date: "Monday",
  },
];
