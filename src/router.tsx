import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import HomeRoute from "@/routes/home";
import LoginRoute from "@/routes/login";
import SalesRoute from "@/routes/sales";
import SignupRoute from "@/routes/signup";

const rootRoute = createRootRoute({
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

    if (error) throw error;
    if (!session) throw redirect({ to: "/login" });
  },
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomeRoute,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginRoute,
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  component: SignupRoute,
});

const salesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sales",
  component: SalesRoute,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  salesRoute,
  loginRoute,
  signupRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
