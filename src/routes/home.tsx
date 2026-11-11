import { CashierIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useNavigate } from "@tanstack/react-router";
import { RecordHarvest } from "@/components/record-harvest";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function HomeRoute() {
  const navigate = useNavigate();

  return (
    <main className="grid lg:grid-cols-[1fr_1fr] gap-3 p-4 h-[calc(100%-48px)]">
      <RecordHarvest />
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
          <p className=" text-2xl font-semibold">
            {new Intl.NumberFormat("en-PH", {
              style: "currency",
              currency: "PHP",
            }).format(0)}
          </p>
        </div>
      </Button>
    </main>
  );
}

export default HomeRoute;
