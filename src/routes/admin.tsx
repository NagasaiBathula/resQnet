import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useAuth, roleHome } from "../lib/auth";
import { useEffect } from "react";

export const Route = createFileRoute("/admin")({
  component: AdminGuard,
});

function AdminGuard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate({ to: "/login" });
      } else if (user.role !== "admin") {
        navigate({ to: roleHome(user.role) });
      }
    }
  }, [user, loading, navigate]);

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="h-screen w-screen grid place-items-center bg-background text-muted-foreground">
        Checking permissions...
      </div>
    );
  }

  return <Outlet />;
}
