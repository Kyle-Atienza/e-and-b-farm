import { createRootRoute, Outlet, redirect } from "@tanstack/react-router";
import {
  getLastAuthenticatedUserId,
  saveLastAuthenticatedUserId,
} from "@/lib/offline";

export const Route = createRootRoute({
  component: Outlet,
  beforeLoad: async ({ location }) => {
    if (location.pathname === "/login" || location.pathname === "/signup") {
      return;
    }

    const { supabase } = await import("@/lib/supabase/client");
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      if (!navigator.onLine) {
        if (await getLastAuthenticatedUserId()) return;
      }

      if (error) throw error;
      throw redirect({ to: "/login" });
    }

    try {
      await saveLastAuthenticatedUserId(session.user.id);
    } catch (error) {
      console.error("Unable to cache the authenticated user:", error);
    }
  },
});
