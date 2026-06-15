import { createFileRoute } from "@tanstack/react-router";
import { RegistrationRequests } from "@/components/registration-requests";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/authority/requests")({
  head: () => ({ meta: [{ title: "Registration Requests — ResQNet Authority" }] }),
  component: AuthorityRequestsPage,
});

function AuthorityRequestsPage() {
  return (
    <AppShell title="Registration Requests" actions={null}>
      <p className="text-muted-foreground -mt-1 mb-6">
        Review pending Volunteer and Rescue Team registrations.
      </p>
      <RegistrationRequests />
    </AppShell>
  );
}
