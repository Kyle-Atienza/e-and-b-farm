import { createFileRoute } from "@tanstack/react-router";
import HarvestBarChart from "./-components/harvest-bar-chart";
import HarvestCalendar from "./-components/harvest-calendar";
import PageContent from "@/components/layout/page-content";

function RouteComponent() {
  return (
    <PageContent>
      <h1 className="text-2xl">Harvests</h1>
      <div className="flex flex-col gap-4">
        <HarvestBarChart />
        <div className="grid md:grid-cols-[repeat(auto-fit,_minmax(400px,_auto))]">
          <HarvestCalendar />
          <div></div>
          <div></div>
        </div>
      </div>
    </PageContent>
  );
}

export const Route = createFileRoute("/_app/harvests/")({
  component: RouteComponent,
});
