import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import {
  getLastAuthenticatedUserId,
  saveLastAuthenticatedUserId,
} from "@/lib/offline";
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

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  staticData: {
    breadcrumb: "Home",
  },
  component: HomeRoute,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  staticData: {
    breadcrumb: "Login",
  },
  component: LoginRoute,
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  staticData: {
    breadcrumb: "Sign Up",
  },
  component: SignupRoute,
});

const salesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sales",
  staticData: {
    breadcrumb: "Sales",
  },
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

declare module "@tanstack/router-core" {
  interface StaticDataRouteOption {
    breadcrumb?: string;
  }
}
