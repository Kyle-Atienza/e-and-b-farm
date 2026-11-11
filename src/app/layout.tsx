import { Outlet } from "@tanstack/react-router";
import { Header } from "@/components/layout/header";
import { SidebarProvider } from "@/components/ui/sidebar";
// import { AppSidebar } from "@/components/layout/sidebar";

function AppLayout() {
  return (
    <>
      <SidebarProvider>
        {/* <AppSidebar /> */}
        <div className="min-h-dvh bg-background text-foreground w-full">
          <Header />
          <Outlet />
        </div>
      </SidebarProvider>
    </>
  );
}

export default AppLayout;
