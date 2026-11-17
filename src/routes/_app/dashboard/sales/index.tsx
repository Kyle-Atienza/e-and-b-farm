import { createFileRoute } from "@tanstack/react-router";

function DashboardSalesRoute() {
  return <h2>Sales</h2>;
}

export const Route = createFileRoute("/_app/dashboard/sales/")({
  component: DashboardSalesRoute,
});
