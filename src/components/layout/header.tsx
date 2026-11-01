import { HugeiconsIcon } from "@hugeicons/react";
import { Notification01Icon } from "@hugeicons/core-free-icons";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Header() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="border-b border-primary/15 bg-primary text-primary-foreground">
      <div className="mx-auto flex h-[88px] max-w-6xl items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-normal">Harvests</h1>
        </div>
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="relative">
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
                <p className="mt-1 text-muted-foreground">
                  No new harvest updates.
                </p>
              </div>
            )}
          </div>
          <Link
            to="/login"
            className="grid size-11 place-items-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-foreground/50"
            aria-label="Account: Kyle Atienza"
          >
            KA
          </Link>
        </div>
      </div>
    </header>
  );
}
