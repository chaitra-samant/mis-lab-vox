import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { getUserRole } from "@/lib/auth";

export const Route = createFileRoute("/customer")({
  beforeLoad: async () => {
    // During SSR, we might not have access to the session.
    // We skip the redirect on the server to prevent being logged out on refresh.
    if (typeof window === "undefined") return;

    const role = await getUserRole();
    if (!role) {
      throw redirect({ to: "/login" });
    }
    if (role !== "customer") {
      const { getRoleRedirectPath } = await import("@/lib/auth");
      throw redirect({ to: getRoleRedirectPath(role) });
    }
  },
  component: () => <Outlet />,
});
