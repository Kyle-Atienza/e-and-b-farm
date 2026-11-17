import clsx from "clsx";
import type { ReactNode } from "react";

export default function PageContent({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <main className={clsx("p-4 gap-4 flex flex-col", className)}>
      {children}
    </main>
  );
}
