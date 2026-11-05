import { CashierIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/layout/header";
import { RecordHarvest } from "@/components/record-harvest";

function HomeRoute() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Header showTitle />
      <main className="grid min-h-[calc(100dvh-72px)] grid-cols-1 sm:grid-cols-2">
        <RecordHarvest />
        <button
          type="button"
          onClick={() => navigate({ to: "/sales" })}
          className="group flex min-h-[42vh] flex-col items-center justify-center gap-4 bg-background px-6 py-10 text-primary transition-colors hover:bg-card focus-visible:z-10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-primary sm:min-h-0"
        >
          <HugeiconsIcon icon={CashierIcon} size={58} strokeWidth={2.2} />
          <span className="max-w-[8ch] text-center text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl">
            Add
            <br />
            Sales
          </span>
        </button>
      </main>
    </div>
  );
}

export default HomeRoute;
