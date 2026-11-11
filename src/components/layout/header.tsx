import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon, Notification01Icon } from "@hugeicons/core-free-icons";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { clearLastAuthenticatedUserId } from "@/lib/offline";
import { syncPendingRecords, useOfflineSyncStatus } from "@/lib/offline-sync";
import logo from "@/assets/logo.png";
import { Breadcrumbs } from "./breadcrumbs";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useSidebar } from "../ui/sidebar";

export function Header() {
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const syncStatus = useOfflineSyncStatus();
  const hasQueuedRecords =
    syncStatus.pendingCount > 0 || syncStatus.needsAttentionCount > 0;
  const syncLabel = syncStatus.isSyncing
    ? "Syncing..."
    : !syncStatus.isOnline
      ? "Offline"
      : syncStatus.needsAttentionCount > 0
        ? `${syncStatus.needsAttentionCount} need attention`
        : syncStatus.pendingCount > 0
          ? `${syncStatus.pendingCount} pending`
          : "Online";

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      const { supabase } = await import("@/lib/supabase/client");
      const { error: signOutError } = await supabase.auth.signOut({
        scope: "local",
      });

      let cacheError: unknown;
      try {
        await clearLastAuthenticatedUserId();
      } catch (error) {
        cacheError = error;
        console.error("Unable to clear the cached authenticated user:", error);
      }

      await navigate({ to: "/login", replace: true });

      if (cacheError) {
        toast.error("Signed out, but offline access could not be cleared");
      } else if (signOutError) {
        console.error(
          "Unable to revoke the server refresh token:",
          signOutError,
        );
        toast.warning("Signed out on this device", {
          description:
            "The server could not revoke this session. It may remain active until it expires.",
        });
      } else {
        toast.success("You have been signed out");
      }
    } catch (error) {
      console.error("Unable to sign out:", error);
      toast.error("Unable to sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <header className="bg-primary text-primary-foreground sticky top-0">
      <div className="flex py-2 items-center justify-between px-5">
        <div className="flex min-w-0 items-center gap-2">
          {/* <Button variant="ghost" size="icon-sm" onClick={toggleSidebar}>
            <HugeiconsIcon icon={Menu01Icon} size={24} className="size-4" />
          </Button> */}
          <Breadcrumbs />
        </div>
        <div className="flex items-center gap-2 sm:gap-5">
          <Tooltip>
            <TooltipTrigger>
              <Badge
                variant="default"
                title={
                  syncStatus.needsAttentionCount > 0
                    ? "Check sign-in and retry syncing saved records."
                    : "Saved records sync automatically when online."
                }
                className="gap-1 text-primary-foreground bg-primary-foreground/20 hover:text-primary-foreground disabled:opacity-90"
              >
                <span
                  aria-hidden="true"
                  data-online={syncStatus.isOnline}
                  className="size-1.5 rounded-full bg-secondary data-[online=false]:bg-destructive"
                />
                <span className="text-xs font-medium">{syncLabel}</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <Button
                disabled={
                  !syncStatus.isOnline ||
                  syncStatus.isSyncing ||
                  !hasQueuedRecords
                }
                aria-label={`Sync status: ${syncLabel}`}
                onClick={() => void syncPendingRecords(true)}
              >
                Sync offline records
              </Button>
            </TooltipContent>
          </Tooltip>

          {/* <div className="relative">
            <Button
              variant="ghost"
              size="icon-lg"
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
              className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              onClick={() => setNotificationsOpen((open) => !open)}
            >
              <HugeiconsIcon
                icon={Notification01Icon}
                size={23}
                strokeWidth={1.8}
              />
            </Button>
            {notificationsOpen && (
              <div className="absolute right-0 top-12 z-20 w-64 rounded-lg border bg-popover p-4 text-sm text-popover-foreground shadow-lg">
                <p className="font-semibold">You’re all caught up</p>
                <p className="mt-1 text-muted-foreground">No new updates.</p>
              </div>
            )}
          </div> */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  className="size-8 rounded-full bg-background text-sm font-semibold text-primary hover:bg-background/80 hover:text-primary focus-visible:ring-[3px] focus-visible:ring-primary-foreground/50"
                  aria-label="Account menu"
                />
              }
            >
              EB
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant="destructive"
                  disabled={isSigningOut}
                  onClick={() => void handleSignOut()}
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
