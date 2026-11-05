import { Constants, type Database } from "@/lib/supabase/database.types";

export type Harvest = {
  id: number;
  crop: string;
  weight: number;
  time: string;
  date: string;
};

export type HarvestRecordDraft = {
  quantity: number;
  harvest_date: string;
  harvest_period: HarvestPeriod;
  recorded_by: string;
};

export type HarvestPeriod = Database["public"]["Enums"]["harvest_period"];

export const HARVEST_PERIOD_OPTIONS = Constants.public.Enums.harvest_period.map(
  (value) => ({
    value,
    label: value.charAt(0) + value.slice(1).toLowerCase(),
  }),
);

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
