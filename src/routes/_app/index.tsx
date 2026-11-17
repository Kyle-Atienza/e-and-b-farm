import { createFileRoute } from "@tanstack/react-router";
import { RecordHarvestButton } from "@/components/record-harvest-button";
import { AddSalesButton } from "@/components/add-sales-button";
import PageContent from "@/components/layout/page-content";

function HomeRoute() {
  return (
    <PageContent className="flex-1">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-3 h-[calc(100%-48px)]">
        <RecordHarvestButton />
        <AddSalesButton />
      </div>
    </PageContent>
  );
}

export const Route = createFileRoute("/_app/")({
  staticData: {
    breadcrumb: "Home",
  },
  component: HomeRoute,
});
