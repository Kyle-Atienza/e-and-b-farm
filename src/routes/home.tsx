import { RecordHarvestButton } from "@/components/record-harvest-button";
import { AddSalesButton } from "@/components/add-sales-button";

function HomeRoute() {
  return (
    <main className="grid lg:grid-cols-[1fr_1fr] gap-3 p-4 h-[calc(100%-48px)]">
      <RecordHarvestButton />
      <AddSalesButton />
    </main>
  );
}

export default HomeRoute;
