import { useMemo, useState } from "react";
import { ArrowDown01Icon, BarChartIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import type { Harvest } from "@/lib/harvest-data";

const periods = ["Day", "Week", "Month"] as const;
type Period = (typeof periods)[number];

type HarvestHistoryProps = {
  crop: string;
  harvests: Harvest[];
};

export function HarvestHistory({ crop, harvests }: HarvestHistoryProps) {
  const [period, setPeriod] = useState<Period>("Week");
  const [view, setView] = useState<"table" | "chart">("table");

  const visibleHarvests = useMemo(() => {
    const cropHarvests = harvests.filter((harvest) => harvest.crop === crop);
    if (period === "Day") {
      return cropHarvests.filter((harvest) => harvest.date === "Today");
    }
    if (period === "Month") return cropHarvests;
    return cropHarvests.filter((harvest) => harvest.date !== "Monday");
  }, [crop, harvests, period]);

  return (
    <section className="mt-9" aria-labelledby="past-heading">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            id="past-heading"
            className="text-2xl font-semibold tracking-normal"
          >
            Past harvests
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {visibleHarvests.length} records for {crop.toLowerCase()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={view === "chart" ? "secondary" : "outline"}
            size="icon-lg"
            aria-label={view === "table" ? "Show chart" : "Show table"}
            aria-pressed={view === "chart"}
            onClick={() =>
              setView((current) => (current === "table" ? "chart" : "table"))
            }
          >
            <HugeiconsIcon icon={BarChartIcon} size={20} strokeWidth={1.8} />
          </Button>
          <label className="relative block">
            <span className="sr-only">Filter by time period</span>
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value as Period)}
              className="h-11 appearance-none rounded-lg border border-input bg-card pl-4 pr-10 text-sm font-medium outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
            >
              {periods.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
          </label>
        </div>
      </div>

      {view === "table" ? (
        <div className="max-h-[510px] overflow-auto rounded-xl border bg-card shadow-sm">
          <table className="w-full min-w-[420px] border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10 bg-secondary text-secondary-foreground">
              <tr>
                <th scope="col" className="px-5 py-4 font-semibold">
                  Time
                </th>
                <th scope="col" className="px-5 py-4 font-semibold">
                  Weight (kg)
                </th>
                <th scope="col" className="px-5 py-4 font-semibold">
                  Recorded by
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visibleHarvests.map((harvest) => (
                <tr
                  key={harvest.id}
                  className="transition-colors hover:bg-muted/50"
                >
                  <td className="px-5 py-4 font-medium">{harvest.time}</td>
                  <td className="px-5 py-4 tabular-nums">
                    {harvest.weight.toFixed(2)}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
                      {harvest.date}
                    </span>
                  </td>
                </tr>
              ))}
              {visibleHarvests.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-12 text-center text-muted-foreground"
                  >
                    No harvests in this period yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border bg-card p-5 shadow-sm sm:p-7">
          <div className="flex h-52 items-end gap-3 border-b border-border pb-3 sm:gap-5">
            {visibleHarvests
              .slice(0, 7)
              .reverse()
              .map((harvest) => (
                <div
                  key={harvest.id}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {harvest.weight.toFixed(1)}
                  </span>
                  <div
                    className="w-full max-w-14 rounded-t-md bg-primary/80 transition-all"
                    style={{
                      height: `${Math.min((harvest.weight / 4) * 75, 75)}%`,
                    }}
                    title={`${harvest.weight.toFixed(2)} kg`}
                  />
                  <span className="text-xs text-muted-foreground">
                    {harvest.date}
                  </span>
                </div>
              ))}
          </div>
          <p className="mt-4 text-right text-xs text-muted-foreground">
            Weight in kilograms
          </p>
        </div>
      )}
    </section>
  );
}
