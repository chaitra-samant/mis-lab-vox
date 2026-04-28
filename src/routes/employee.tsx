import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getUserRole } from "@/lib/auth";

export const Route = createFileRoute("/employee")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const role = await getUserRole();
    if (!role) throw redirect({ to: "/login" });
    if (role !== "employee") {
      const { getRoleRedirectPath } = await import("@/lib/auth");
      throw redirect({ to: getRoleRedirectPath(role) });
    }
  },
  component: () => <Outlet />,
});
