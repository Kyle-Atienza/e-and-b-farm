import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Leaf01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
};

export const authInputClassName =
  "mt-2 h-12 w-full rounded-lg border border-input bg-background px-3.5 text-base text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30";

export function AuthShell({
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-12 text-foreground">
      <div className="pointer-events-none absolute -left-32 -top-32 -z-10 size-80 rounded-full border-[48px] border-secondary/70" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 -z-10 size-96 rounded-full border-[56px] border-accent/40" />

      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-7 inline-flex items-center gap-3 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <HugeiconsIcon icon={Leaf01Icon} size={23} strokeWidth={1.8} />
          </span>
          <span>
            <span className="block text-lg font-semibold leading-tight">
              E &amp; B Farm
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Harvest management
            </span>
          </span>
        </Link>

        <section className="rounded-xl border border-border/80 bg-card p-6 shadow-lg shadow-primary/5 sm:p-8">
          <h1 className="text-2xl font-semibold tracking-normal">{title}</h1>
          <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
          {children}
        </section>

        <div className="mt-5 text-center text-sm text-muted-foreground">
          {footer}
        </div>
      </div>
    </main>
  );
}
