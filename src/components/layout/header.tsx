import { HugeiconsIcon } from "@hugeicons/react";
import { Notification01Icon } from "@hugeicons/core-free-icons";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type HeaderProps = {
  showTitle?: boolean;
};

export function Header({ showTitle = false }: HeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="bg-primary text-primary-foreground">
      <div className="flex h-[72px] items-center justify-between px-5 sm:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            to="/"
            className="shrink-0 rounded-sm text-[25px] leading-none font-extrabold tracking-[-0.1em] text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
            aria-label="E and B Farm home"
          >
            E&amp;B
          </Link>
          {showTitle && (
            <h1 className="truncate text-lg font-medium sm:text-xl">
              Oyster Mushrooms Record
            </h1>
          )}
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
                  No new updates.
                </p>
              </div>
            )}
          </div>
          <Link
            to="/login"
            className="grid size-10 place-items-center rounded-full bg-background text-sm font-semibold text-primary transition-colors hover:bg-background/80 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-foreground/50 sm:size-11"
            aria-label="Account: E and B"
          >
            EB
          </Link>
        </div>
      </div>
    </header>
  );
}
