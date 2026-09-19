import { createFileRoute } from "@tanstack/react-router";
import { AdminDesk } from "@/components/admin-desk";
import { AdminLogin } from "@/components/admin-login";
import { useAdminSession } from "@/lib/use-admin";

export const Route = createFileRoute("/admin")({
  component: AdminRoute,
  head: () => ({
    meta: [
      { title: "VIXL Desk" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function AdminRoute() {
  const { ready, isAdmin, user } = useAdminSession();

  if (!ready) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center">
        <p className="text-sm tracking-[0.16em] text-muted uppercase">Opening desk</p>
      </main>
    );
  }

  if (!isAdmin || !user?.email) {
    return <AdminLogin />;
  }

  return <AdminDesk email={user.email} />;
}
