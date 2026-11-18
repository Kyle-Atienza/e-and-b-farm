import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { format, isValid, parse } from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getLastAuthenticatedUserId, offlineDb } from "@/lib/offline";
import { useOfflineSyncStatus } from "@/lib/offline-sync";
import { type HarvestPeriod } from "@/lib/harvest-data";
import PageContent from "@/components/layout/page-content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerButton } from "@/components/date-picker-button";
import type {
  HarvestRecord,
  HarvestRecordUpdate,
} from "./-components/edit-harvest-record-dialog";
import EditHarvestRecordDialog from "./-components/edit-harvest-record-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const formatQuantity = new Intl.NumberFormat("en-PH", {
  maximumFractionDigits: 2,
});

function parseRouteDate(value: string) {
  const parsedDate = parse(value, "MM-dd-yyyy", new Date());
  if (!isValid(parsedDate) || format(parsedDate, "MM-dd-yyyy") !== value) {
    throw notFound();
  }
  return parsedDate;
}

function HarvestDateRoute() {
  const { date } = Route.useParams();
  const navigate = useNavigate();
  const selectedDate = parseRouteDate(date);
  const harvestDate = format(selectedDate, "yyyy-MM-dd");
  const [records, setRecords] = useState<HarvestRecord[]>([]);
  const [selectedPeriod, setSelectedPeriod] =
    useState<HarvestPeriod>("MORNING");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const syncStatus = useOfflineSyncStatus();
  const totalHarvest = records.reduce((prev, curr) => {
    prev += curr.quantity;
    return prev;
  }, 0);

  function navigateToDate(nextDate: Date) {
    void navigate({
      to: "/harvests/$date",
      params: { date: format(nextDate, "MM-dd-yyyy") },
    });
  }

  async function updateHarvestRecord(
    record: HarvestRecord,
    values: HarvestRecordUpdate,
  ): Promise<boolean> {
    try {
      if (record.id.startsWith("local-")) {
        const queueId = record.id.slice("local-".length);
        let currentUserId: string | null;
        if (navigator.onLine) {
          const { supabase } = await import("@/lib/supabase/client");
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          currentUserId = data.session?.user.id ?? null;
        } else {
          currentUserId = await getLastAuthenticatedUserId();
        }

        await offlineDb.transaction("rw", offlineDb.syncQueue, async () => {
          const entry = await offlineDb.syncQueue.get(queueId);
          if (!entry || entry.type !== "harvest") {
            throw new Error("This queued harvest could not be found.");
          }
          if (!currentUserId || entry.userId !== currentUserId) {
            throw new Error(
              "Sign in with the account that recorded this harvest to edit it.",
            );
          }
          if (entry.status === "syncing" || entry.status === "synced") {
            throw new Error(
              "This harvest is syncing. Wait for sync to finish and try again.",
            );
          }

          await offlineDb.syncQueue.put({
            ...entry,
            record: {
              ...entry.record,
              ...values,
            },
            updatedAt: new Date().toISOString(),
          });
        });
      } else {
        if (!navigator.onLine) {
          throw new Error("Reconnect to edit this synced harvest.");
        }

        const databaseId = Number(record.id.slice("server-".length));
        if (!Number.isSafeInteger(databaseId) || databaseId <= 0) {
          throw new Error("This harvest record has an invalid ID.");
        }

        const { supabase } = await import("@/lib/supabase/client");
        const { data, error } = await supabase
          .from("harvest_records")
          .update(values)
          .eq("id", databaseId)
          .select("id")
          .single();

        if (error) throw error;
        if (!data) throw new Error("The harvest record was not updated.");
      }

      setRecords((current) =>
        current.map((item) =>
          item.id === record.id ? { ...item, ...values } : item,
        ),
      );
      toast.success(
        record.id.startsWith("local-")
          ? "Harvest updated on this device"
          : "Harvest updated",
      );
      return true;
    } catch (error) {
      console.error("Unable to update harvest record:", error);
      toast.error("Unable to update harvest", {
        description:
          error instanceof Error
            ? error.message
            : "Please try again. Your changes were not saved.",
      });
      return false;
    }
  }

  useEffect(() => {
    let isCurrent = true;

    async function loadHarvestRecords() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const recordsForDate: HarvestRecord[] = [];
        const syncedHarvests = new Set<string>();
        const { supabase } = await import("@/lib/supabase/client");
        const pageSize = 1000;
        let offset = 0;

        while (true) {
          const { data, error } = await supabase
            .from("harvest_records")
            .select(
              "id, client_request_id, quantity, harvest_period, recorded_by",
            )
            .eq("harvest_date", harvestDate)
            .order("id", { ascending: true })
            .range(offset, offset + pageSize - 1);

          if (error) throw error;

          for (const record of data) {
            recordsForDate.push({
              id: `server-${record.id}`,
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
            entry.record.harvest_date !== harvestDate ||
            syncedHarvests.has(entry.id)
          ) {
            continue;
          }

          recordsForDate.push({
            id: `local-${entry.id}`,
            quantity: entry.record.quantity,
            harvest_period: entry.record.harvest_period,
            recorded_by: entry.record.recorded_by,
          });
        }

        if (isCurrent) setRecords(recordsForDate);
      } catch (error) {
        console.error("Unable to load harvest records for date:", error);
        if (isCurrent) {
          setRecords([]);
          setErrorMessage("Unable to load harvest records. Please try again.");
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    void loadHarvestRecords();

    return () => {
      isCurrent = false;
    };
  }, [
    harvestDate,
    syncStatus.isSyncing,
    syncStatus.pendingCount,
    syncStatus.needsAttentionCount,
  ]);

  const periodTotals: Record<HarvestPeriod, number> = {
    MORNING: 0,
    NOON: 0,
    AFTERNOON: 0,
  };
  for (const record of records) {
    if (record.harvest_period) {
      periodTotals[record.harvest_period] += record.quantity;
    }
  }

  const periodTabs: Array<{
    value: HarvestPeriod;
    label: string;
    badgeClassName: string;
  }> = [
    {
      value: "MORNING",
      label: "Morning",
      badgeClassName: "bg-yellow-200 text-yellow-800 border-yellow-300",
    },
    {
      value: "NOON",
      label: "Noon",
      badgeClassName: "bg-yellow-400 text-yellow-800 border-yellow-500",
    },
    {
      value: "AFTERNOON",
      label: "Afternoon",
      badgeClassName: "bg-orange-300 text-orange-800 border-orange-400",
    },
  ];

  function handlePeriodChange(value: string | number | null) {
    if (value === "MORNING" || value === "NOON" || value === "AFTERNOON") {
      setSelectedPeriod(value);
    }
  }

  return (
    <PageContent className="flex-1">
      <h1 className="text-2xl font-semibold">Harvest Details</h1>
      <div className="flex justify-between items-center">
        <p>{format(selectedDate, "MMMM dd yyyy")}</p>
        <DatePickerButton
          key={harvestDate}
          selectedDate={selectedDate}
          onDateSelect={navigateToDate}
        />
      </div>
      <Card size="sm" className="gap-2">
        <CardHeader>
          <CardTitle>Total Harvest</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-5xl font-semibold">
            {formatQuantity.format(totalHarvest)} kg
          </p>
        </CardContent>
      </Card>
      <div className="grid grid-cols-[repeat(3,_1fr)] gap-4">
        {periodTabs.map((period) => {
          return (
            <Card size="sm">
              <CardHeader>
                <CardTitle>
                  <Badge className={period.badgeClassName}>
                    <span className="text-ellipsis">{period.label}</span>
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-semibold text-foreground">
                  {formatQuantity.format(periodTotals[period.value])} kg
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Card className="flex-1" size="sm">
        <CardHeader>
          <CardTitle>Harvest Periods</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4">
          <Tabs
            value={selectedPeriod}
            onValueChange={handlePeriodChange}
            className="flex flex-1 flex-col gap-4"
          >
            <TabsList>
              {periodTabs.map((period) => (
                <TabsTrigger key={period.value} value={period.value}>
                  {period.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {periodTabs.map((period) => {
              const periodRecords = records.filter(
                (record) => record.harvest_period === period.value,
              );

              return (
                <TabsContent
                  key={period.value}
                  value={period.value}
                  className="min-h-0 flex-1"
                >
                  {errorMessage ? (
                    <p
                      className="py-8 text-center text-sm text-destructive"
                      role="alert"
                    >
                      {errorMessage}
                    </p>
                  ) : (
                    <div className="h-full overflow-hidden rounded-md border">
                      <Table className="h-full">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Recorded by</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {periodRecords.map((record) => (
                            <TableRow key={record.id}>
                              <TableCell>
                                {formatQuantity.format(record.quantity)} kg
                              </TableCell>
                              <TableCell>{record.recorded_by || "—"}</TableCell>
                              <TableCell>
                                <EditHarvestRecordDialog
                                  record={record}
                                  onSave={(values) =>
                                    updateHarvestRecord(record, values)
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                          {periodRecords.length === 0 && (
                            <TableRow>
                              <TableCell
                                colSpan={3}
                                className="h-20 text-center text-muted-foreground"
                                role={isLoading ? "status" : undefined}
                              >
                                {isLoading
                                  ? "Loading harvest records..."
                                  : `No ${period.label.toLowerCase()} harvests recorded for this day.`}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </PageContent>
  );
}

export const Route = createFileRoute("/_app/harvests/$date/")({
  component: HarvestDateRoute,
  notFoundComponent: () => <p>Invalid harvest date.</p>,
});
