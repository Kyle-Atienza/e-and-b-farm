import {
  createFileRoute,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import PageContent from "@/components/layout/page-content";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type DashboardTab = "harvest" | "sales";

function DashboardLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const activeTab: DashboardTab = pathname.startsWith("/dashboard/sales")
    ? "sales"
    : "harvest";

  function handleTabChange(value: string | number | null) {
    if (value === "sales") {
      void navigate({ to: "/dashboard/sales" });
    } else if (value === "harvest") {
      void navigate({ to: "/harvests" });
    }
  }

  return (
    <PageContent className="flex-1">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <TabsList>
            <TabsTrigger value="harvest">Harvest</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value={activeTab}>
          <Outlet />
        </TabsContent>
      </Tabs>
    </PageContent>
  );
}

export const Route = createFileRoute("/_app/dashboard")({
  staticData: {
    breadcrumb: "Dashboard",
  },
  component: DashboardLayout,
});
