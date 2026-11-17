import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/dashboard/")({
  beforeLoad: ({ location }) => {
    if (
      location.pathname === "/dashboard" ||
      location.pathname === "/dashboard/"
    ) {
      throw redirect({
        to: "/dashboard/harvests",
        replace: true,
      });
    }
  },
});
