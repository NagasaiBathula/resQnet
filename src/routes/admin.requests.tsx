import { createFileRoute } from "@tanstack/react-router";
import { RegistrationRequests } from "@/components/registration-requests";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/admin/requests")({
  head: () => ({ meta: [{ title: "Registration Requests — ResQNet Admin" }] }),
  component: AdminRequestsPage,
});

function AdminRequestsPage() {
  return (
    <AppShell title="Registration Requests" actions={null}>
      <p className="text-muted-foreground -mt-1 mb-6">Review and process platform volunteer and rescue team registrations.</p>
      <RegistrationRequests />
    </AppShell>
  );
}
