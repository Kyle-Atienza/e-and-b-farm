import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  CashierIcon,
  Home07Icon,
  Plant01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo-dark.svg";
import clsx from "clsx";

export function AppSidebar() {
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader
        className={clsx(
          "py-0 h-[48px] flex items-start justify-center transition-all",
          open ? "px-4" : "px-2",
        )}
      >
        <Link
          to="/"
          className="shrink-0 rounded-sm text-[25px] leading-none font-bold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
          aria-label="E and B Farm home"
        >
          <img className="w-[32px]" src={logo} alt="" />
        </Link>
        {/* <SidebarMenuButton render={<a href="/" />}>
          <img className="w-[24px]" src={logo} alt="" />
          <span>E and B Farm</span>
        </SidebarMenuButton> */}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link to="/" />}>
                <HugeiconsIcon icon={Home07Icon} strokeWidth={2} />
                <span>Home</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {/* <SidebarMenuItem>
              <SidebarMenuButton render={<Link to="/" />}>
                <HugeiconsIcon
                  icon={DashboardBrowsingFreeIcons}
                  strokeWidth={2}
                />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem> */}
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link to="/harvests" />}>
                <HugeiconsIcon icon={Plant01Icon} strokeWidth={2} />
                <span>Harvests</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link to="/sales" />}>
                <HugeiconsIcon icon={CashierIcon} strokeWidth={2} />
                <span>Sales</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
