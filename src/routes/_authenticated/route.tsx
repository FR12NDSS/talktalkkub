import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { currentUserId } from "@/lib/mock-db";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: () => {
    const userId = currentUserId();
    if (!userId) throw redirect({ to: "/login" });
    return { userId };
  },
  component: () => <Outlet />,
});
