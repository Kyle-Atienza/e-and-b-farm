import { useState } from "react";
import {
  CashierIcon,
  ShoppingBasket01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/layout/header";
import { RecordHarvestDialog } from "@/components/record-harvest-dialog";
import type { HarvestRecordDraft } from "@/lib/harvest-data";

function HomeRoute() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [, setHarvestRecords] = useState<HarvestRecordDraft[]>([]);

  function recordHarvest(record: HarvestRecordDraft) {
    setHarvestRecords((current) => [...current, record]);
    setIsRecording(false);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header showTitle />
      <main className="grid min-h-[calc(100dvh-72px)] grid-cols-1 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setIsRecording(true)}
          className="group flex min-h-[42vh] flex-col items-center justify-center gap-4 bg-accent px-6 py-10 text-primary transition-colors hover:bg-accent/90 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-primary sm:min-h-0"
        >
          <HugeiconsIcon
            icon={ShoppingBasket01Icon}
            size={58}
            strokeWidth={2.2}
          />
          <span className="max-w-[9ch] text-center text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl">
            Record
            <br />
            Harvest
          </span>
        </button>
        <button
          type="button"
          onClick={() => navigate({ to: "/sales" })}
          className="group flex min-h-[42vh] flex-col items-center justify-center gap-4 bg-background px-6 py-10 text-primary transition-colors hover:bg-card focus-visible:z-10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-primary sm:min-h-0"
        >
          <HugeiconsIcon
            icon={CashierIcon}
            size={58}
            strokeWidth={2.2}
          />
          <span className="max-w-[8ch] text-center text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl">
            Add
            <br />
            Sales
          </span>
          <span className="rounded-full bg-accent px-6 py-3 text-lg font-medium text-secondary-foreground transition-colors group-hover:bg-accent/80">
            Price Calculator
          </span>
        </button>
      </main>
      <RecordHarvestDialog
        open={isRecording}
        onClose={() => setIsRecording(false)}
        onRecord={recordHarvest}
      />
    </div>
  );
}

export default HomeRoute;
