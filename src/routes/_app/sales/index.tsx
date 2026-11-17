import { createFileRoute } from "@tanstack/react-router";
import PageContent from "@/components/layout/page-content";

function SalesRoute() {
  return <PageContent>Sales</PageContent>;
}

export const Route = createFileRoute("/_app/sales/")({
  staticData: {
    breadcrumb: "Sales",
  },
  component: SalesRoute,
});
