import { useNavigate } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { CashierIcon } from "@hugeicons/core-free-icons";
import { Badge } from "./ui/badge";
import { useEffect, useState } from "react";

const manilaDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Manila",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function getManilaDayRange(now: Date) {
  const dateParts = manilaDateFormatter.formatToParts(now);
  const year = Number(dateParts.find((part) => part.type === "year")?.value);
  const month = Number(dateParts.find((part) => part.type === "month")?.value);
  const day = Number(dateParts.find((part) => part.type === "day")?.value);
  const today = `${year.toString().padStart(4, "0")}-${month
    .toString()
    .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
  const tomorrow = new Date(Date.UTC(year, month - 1, day + 1))
    .toISOString()
    .slice(0, 10);

  return {
    start: new Date(`${today}T00:00:00+08:00`).toISOString(),
    end: new Date(`${tomorrow}T00:00:00+08:00`).toISOString(),
  };
}

const formatCurrency = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

export function AddSalesButton() {
  const navigate = useNavigate();

  const [todaySalesTotal, setTodaySalesTotal] = useState<number | null>(null);
  const [isLoadingSales, setIsLoadingSales] = useState(true);
  const [salesLoadFailed, setSalesLoadFailed] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    async function loadTodaySales() {
      try {
        const { start, end } = getManilaDayRange(new Date());
        const { supabase } = await import("@/lib/supabase/client");
        const pageSize = 1000;
        let offset = 0;
        let total = 0;

        while (true) {
          const { data, error } = await supabase
            .from("sales")
            .select("total_amount")
            .gte("created_at", start)
            .lt("created_at", end)
            .order("id", { ascending: true })
            .range(offset, offset + pageSize - 1);

          if (error) throw error;
          total += data.reduce((sum, sale) => sum + sale.total_amount, 0);
          if (data.length < pageSize) break;
          offset += pageSize;
        }

        if (isCurrent) setTodaySalesTotal(total);
      } catch (error) {
        console.error("Unable to load today's sales:", error);
        if (isCurrent) setSalesLoadFailed(true);
      } finally {
        if (isCurrent) setIsLoadingSales(false);
      }
    }

    void loadTodaySales();

    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <Button
      className="flex-1 flex flex-col w-full rounded-lg h-full gap-4"
      size={"icon-lg"}
      onClick={() => navigate({ to: "/sales" })}
    >
      <span className="flex flex-col gap-2 items-center">
        <HugeiconsIcon
          icon={CashierIcon}
          size={58}
          className="size-10"
          strokeWidth={2}
        />
        <span className="text-center text-4xl font-semibold tracking-tight sm:text-5xl">
          Add
          <br />
          Sales
        </span>
      </span>
      <div className="flex flex-col gap-2">
        <Badge variant="secondary">Today's Sales</Badge>
        <p className="text-2xl font-semibold" aria-live="polite">
          {isLoadingSales
            ? "Loading..."
            : salesLoadFailed
              ? "Unavailable"
              : formatCurrency.format(todaySalesTotal ?? 0)}
        </p>
      </div>
    </Button>
  );
}
