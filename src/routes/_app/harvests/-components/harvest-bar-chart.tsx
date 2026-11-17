import { offlineDb } from "@/lib/offline";
import { useOfflineSyncStatus } from "@/lib/offline-sync";
import { Suspense, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type DailyHarvest = {
  date: string;
  label: string;
  quantity: number;
};

const formatQuantity = new Intl.NumberFormat("en-PH", {
  maximumFractionDigits: 2,
});

const manilaDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Manila",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const chartDateFormatter = new Intl.DateTimeFormat("en-PH", {
  timeZone: "UTC",
  weekday: "short",
  day: "numeric",
});

function getLastSevenDates(): DailyHarvest[] {
  const dateParts = manilaDateFormatter.formatToParts(new Date());
  const year = Number(dateParts.find((part) => part.type === "year")?.value);
  const month = Number(dateParts.find((part) => part.type === "month")?.value);
  const day = Number(dateParts.find((part) => part.type === "day")?.value);
  const today = Date.UTC(year, month - 1, day);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today + (index - 6) * 24 * 60 * 60 * 1000);
    return {
      date: date.toISOString().slice(0, 10),
      label: chartDateFormatter.format(date),
      quantity: 0,
    };
  });
}

export default function HarvestBarChart() {
  const [harvests, setHarvests] = useState<DailyHarvest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadFailed, setHasLoadFailed] = useState(false);
  const syncStatus = useOfflineSyncStatus();

  useEffect(() => {
    let isCurrent = true;

    async function loadHarvests() {
      setIsLoading(true);
      setHasLoadFailed(false);

      try {
        const dates = getLastSevenDates();
        const firstDate = dates[0].date;
        const lastDate = dates[dates.length - 1].date;
        const totals = new Map(dates.map(({ date }) => [date, 0]));
        const syncedHarvests = new Set<string>();
        const { supabase } = await import("@/lib/supabase/client");
        const pageSize = 1000;
        let offset = 0;

        while (true) {
          const { data, error } = await supabase
            .from("harvest_records")
            .select("client_request_id, harvest_date, quantity")
            .gte("harvest_date", firstDate)
            .lte("harvest_date", lastDate)
            .order("id", { ascending: true })
            .range(offset, offset + pageSize - 1);

          if (error) throw error;

          for (const record of data) {
            if (!record.harvest_date) continue;
            totals.set(
              record.harvest_date,
              (totals.get(record.harvest_date) ?? 0) + (record.quantity ?? 0),
            );
            if (record.client_request_id) {
              syncedHarvests.add(record.client_request_id);
            }
          }

          if (data.length < pageSize) break;
          offset += pageSize;
        }

        const queuedHarvests = await offlineDb.syncQueue
          .where("type")
          .equals("harvest")
          .toArray();

        for (const entry of queuedHarvests) {
          if (
            entry.type !== "harvest" ||
            entry.status === "synced" ||
            syncedHarvests.has(entry.id)
          ) {
            continue;
          }
          const total = totals.get(entry.record.harvest_date);
          if (total !== undefined) {
            totals.set(
              entry.record.harvest_date,
              total + entry.record.quantity,
            );
          }
        }

        if (isCurrent) {
          setHarvests(
            dates.map((item) => ({
              ...item,
              quantity: totals.get(item.date) ?? 0,
            })),
          );
        }
      } catch (error) {
        console.error("Unable to load weekly harvest data:", error);
        if (isCurrent) setHasLoadFailed(true);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    void loadHarvests();

    return () => {
      isCurrent = false;
    };
  }, [
    syncStatus.isSyncing,
    syncStatus.pendingCount,
    syncStatus.needsAttentionCount,
  ]);

  return (
    <section
      className="rounded-xl border bg-card p-5 shadow-sm sm:p-7"
      aria-labelledby="harvest-chart-title"
    >
      <div className="mb-5">
        <h2 id="harvest-chart-title" className="text-lg font-semibold">
          Daily Harvest
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Harvested quantity over the last 7 days
        </p>
      </div>

      {isLoading ? (
        <p className="py-24 text-center text-sm text-muted-foreground">
          Loading harvest data...
        </p>
      ) : hasLoadFailed ? (
        <p className="py-24 text-center text-sm text-destructive" role="alert">
          Unable to load harvest data. Please refresh and try again.
        </p>
      ) : (
        <div
          className="h-64 w-full sm:h-80"
          role="img"
          aria-label="Bar chart showing daily harvest quantity in kilograms for the last 7 days"
        >
          <Suspense
            fallback={
              <p className="py-24 text-center text-sm text-muted-foreground">
                Loading chart...
              </p>
            }
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={harvests}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="var(--border)"
                  strokeDasharray="4 4"
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  tickFormatter={(value: number) =>
                    formatQuantity.format(value)
                  }
                  width={48}
                />
                <Tooltip
                  formatter={(value) => [
                    `${formatQuantity.format(Number(value))} kg`,
                    "Harvest",
                  ]}
                  contentStyle={{
                    borderRadius: "0.75rem",
                    borderColor: "var(--border)",
                    backgroundColor: "var(--card)",
                    color: "var(--card-foreground)",
                  }}
                />
                <Bar
                  dataKey="quantity"
                  name="Harvest"
                  fill="var(--primary)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={56}
                />
              </BarChart>
            </ResponsiveContainer>
          </Suspense>
        </div>
      )}
    </section>
  );
}
