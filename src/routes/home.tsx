import { useEffect, useState } from "react";
import { Add01Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { HarvestHistory } from "@/components/harvest-history";
import { RecordHarvestDialog } from "@/components/record-harvest-dialog";
import { CROPS, INITIAL_HARVESTS } from "@/lib/harvest-data";
import { Header } from "@/components/layout/header";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";

type Crop = Database["public"]["Tables"]["crops"]["Row"];

function HomeRoute() {
  const [crop, setCrop] = useState(CROPS[0]);
  const [harvests, setHarvests] = useState(INITIAL_HARVESTS);
  const [isRecording, setIsRecording] = useState(false);

  const [crops, setCrops] = useState<Crop[]>([]);

  async function getCrops() {
    const { data, error } = await supabase.from("crops").select();
    if (error) {
      console.error(error);
      return;
    }
    setCrops(data);
  }

  useEffect(() => {
    getCrops();
  }, []);

  const todayTotal = harvests
    .filter((harvest) => harvest.crop === crop && harvest.date === "Today")
    .reduce((total, harvest) => total + harvest.weight, 0);

  function recordHarvest(weight: number) {
    setHarvests((current) => [
      {
        id: Date.now(),
        crop,
        weight,
        time: new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }).format(new Date()),
        date: "Today",
      },
      ...current,
    ]);
    setIsRecording(false);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto max-w-6xl px-5 pb-12 pt-8 sm:px-8 sm:pt-10">
        <label className="relative block max-w-sm">
          <span className="sr-only">Select crop</span>
          <select
            value={crop}
            onChange={(event) => setCrop(event.target.value)}
            className="h-12 w-full appearance-none rounded-lg border border-input bg-card px-4 pr-11 text-base font-medium shadow-sm outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
          >
            {crops.map((option, index) => (
              <option key={index}>{option.name}</option>
            ))}
          </select>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={18}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
        </label>

        <section
          aria-labelledby="today-heading"
          className="relative mt-7 overflow-hidden rounded-xl border border-primary/10 bg-secondary px-6 py-8 text-center sm:py-10"
        >
          <div className="pointer-events-none absolute -right-10 -top-14 size-48 rounded-full border-[24px] border-primary/5" />
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary/70">
            Tuesday, October 13
          </p>
          <h2
            id="today-heading"
            className="mt-2 text-lg font-medium text-secondary-foreground/75"
          >
            Today’s harvest
          </h2>
          <p className="mt-1 text-7xl font-semibold leading-none tracking-normal text-primary sm:text-8xl">
            {todayTotal.toFixed(1)}
            <span className="ml-2 text-3xl font-medium sm:text-4xl">kg</span>
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            {
              harvests.filter(
                (item) => item.crop === crop && item.date === "Today",
              ).length
            }{" "}
            harvest records today
          </p>
        </section>

        <Button
          size="lg"
          className="mt-5 h-14 w-full gap-3 rounded-lg text-base font-semibold shadow-sm"
          onClick={() => setIsRecording(true)}
        >
          <HugeiconsIcon icon={Add01Icon} size={22} strokeWidth={2} />
          Record harvest
        </Button>

        <HarvestHistory crop={crop} harvests={harvests} />
      </main>

      <RecordHarvestDialog
        open={isRecording}
        crop={crop}
        onClose={() => setIsRecording(false)}
        onRecord={recordHarvest}
      />
    </div>
  );
}

export default HomeRoute;
