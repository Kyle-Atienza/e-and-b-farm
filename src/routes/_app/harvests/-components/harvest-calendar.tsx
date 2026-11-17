import { format, startOfMonth, endOfMonth } from "date-fns";
import { useEffect, useState } from "react";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { offlineDb } from "@/lib/offline";
import { useOfflineSyncStatus } from "@/lib/offline-sync";
import type { HarvestPeriod } from "@/lib/harvest-data";
import { Link } from "@tanstack/react-router";

const formatQuantity = new Intl.NumberFormat("en-PH", {
  maximumFractionDigits: 2,
});

type DailyHarvestRecord = {
  id: string;
  harvest_date: string;
  quantity: number;
  harvest_period: HarvestPeriod | null;
  recorded_by: string | null;
};

export default function HarvestCalendar() {
  const [date, setDate] = useState<Date | undefined>(() => new Date());
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [dailyHarvests, setDailyHarvests] = useState<Map<string, number>>(
    () => new Map(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const syncStatus = useOfflineSyncStatus();

  useEffect(() => {
    let isCurrent = true;

    async function loadMonthHarvests() {
      setIsLoading(true);
      setDailyHarvests(new Map());

      try {
        const firstDate = format(startOfMonth(month), "yyyy-MM-dd");
        const lastDate = format(endOfMonth(month), "yyyy-MM-dd");
        const records: DailyHarvestRecord[] = [];
        const syncedHarvests = new Set<string>();
        const { supabase } = await import("@/lib/supabase/client");
        const pageSize = 1000;
        let offset = 0;

        while (true) {
          const { data, error } = await supabase
            .from("harvest_records")
            .select(
              "id, client_request_id, harvest_date, quantity, harvest_period, recorded_by",
            )
            .gte("harvest_date", firstDate)
            .lte("harvest_date", lastDate)
            .order("id", { ascending: true })
            .range(offset, offset + pageSize - 1);

          if (error) throw error;

          for (const record of data) {
            if (!record.harvest_date) continue;
            records.push({
              id: `server-${record.id}`,
              harvest_date: record.harvest_date,
              quantity: record.quantity ?? 0,
              harvest_period: record.harvest_period,
              recorded_by: record.recorded_by,
            });
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

          const harvestDate = entry.record.harvest_date;
          if (harvestDate < firstDate || harvestDate > lastDate) continue;
          records.push({
            id: `local-${entry.id}`,
            harvest_date: harvestDate,
            quantity: entry.record.quantity,
            harvest_period: entry.record.harvest_period,
            recorded_by: entry.record.recorded_by,
          });
        }

        const totals = new Map<string, number>();
        for (const record of records) {
          totals.set(
            record.harvest_date,
            (totals.get(record.harvest_date) ?? 0) + record.quantity,
          );
        }

        if (isCurrent) {
          setDailyHarvests(totals);
        }
      } catch (error) {
        console.error("Unable to load monthly harvest data:", error);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    void loadMonthHarvests();

    return () => {
      isCurrent = false;
    };
  }, [
    month,
    syncStatus.isSyncing,
    syncStatus.pendingCount,
    syncStatus.needsAttentionCount,
  ]);

  return (
    <Dialog>
      <Card size="sm">
        <CardHeader>
          <CardTitle>Daily Harvest</CardTitle>
          <CardDescription>
            Daily totals for {format(month, "MMMM yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            month={month}
            onMonthChange={(nextMonth) => {
              setMonth(startOfMonth(nextMonth));
              setDate(startOfMonth(nextMonth));
            }}
            captionLayout="dropdown"
            selected={date}
            onSelect={setDate}
            className="w-full rounded-lg border [--cell-size:--spacing(10)] md:[--cell-size:--spacing(12)]"
            components={{
              DayButton: ({ children, modifiers, day, ...props }) => {
                const harvestDate = format(day.date, "yyyy-MM-dd");
                const quantity = dailyHarvests.get(harvestDate) ?? 0;

                return (
                  <CalendarDayButton day={day} modifiers={modifiers} {...props}>
                    {children}
                    {!isLoading && quantity > 0 && (
                      <span className="text-[10px] font-medium tabular-nums">
                        {formatQuantity.format(quantity)}kg
                      </span>
                    )}
                  </CalendarDayButton>
                );
              },
            }}
          />
        </CardContent>
        <CardFooter>
          <DialogTrigger
            render={
              <Link
                to="/harvests/$date"
                params={{
                  date: date ? format(date, "MM-dd-yyyy") : "",
                }}
              />
            }
          >
            <Button>View Harvest Details</Button>
          </DialogTrigger>
        </CardFooter>
      </Card>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{date ? format(date, "MMMM d") : ""}</DialogTitle>
          <DialogDescription>
            <div>
              <span className="font-semibold">Date: </span>
              {date ? format(date, "MMMM d") : ""}
            </div>
            <div>
              <span className="font-semibold">Harvested by: </span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}
