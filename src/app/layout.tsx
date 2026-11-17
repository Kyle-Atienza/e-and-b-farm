import { Outlet } from "@tanstack/react-router";
import { Header } from "@/components/layout/header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";

function AppLayout() {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <div className="min-h-dvh bg-background text-foreground w-full flex flex-col">
          <Header />
          <Outlet />
        </div>
      </SidebarProvider>
    </>
  );
}

export default AppLayout;
