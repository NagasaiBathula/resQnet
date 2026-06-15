import { createFileRoute } from "@tanstack/react-router";
import { FeaturePage, PillBadge } from "@/components/feature-page";
import { Shield, Users, Truck, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { CreateUserDialog } from "@/components/create-user-dialog";
import { API_URL } from "@/lib/config";
import { toast } from "sonner";

export const Route = createFileRoute("/authority/teams")({
  head: () => ({ meta: [{ title: "Rescue Teams — ResQNet" }] }),
  component: TeamsPage,
});

function TeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("resqnet.token");
      const res = await fetch(`${API_URL}/api/users?role=rescue`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch rescue teams");
      }
      const data = await res.json();
      
      const mapped = data.map((u: any) => ({
        id: u._id || u.id,
        name: u.organizationName || u.name,
        region: `${u.district}, ${u.state}`,
        specialty: u.specialization || "General SAR",
        lead: u.name,
        members: u.yearsOfExperience ?? 3,
        vehicles: 1,
        readiness: u.status,
      }));
      setTeams(mapped);
    } catch (error) {
      console.error(error);
      toast.error("Error loading rescue teams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return (
    <>
      <FeaturePage
        title="Rescue teams"
        subtitle="Specialty units, readiness, and regional coverage."
        stats={[
          { label: "Teams", value: teams.length.toString(), icon: Shield, accent: "primary" },
          { label: "Ready", value: teams.filter(t => t.readiness === "approved").length.toString(), sublabel: "approved strength", icon: Shield, accent: "success" },
          { label: "Deployed", value: teams.filter(t => t.readiness === "pending").length.toString(), sublabel: "pending review", icon: Truck, accent: "warning" },
          { label: "Personnel", value: (teams.length * 6).toString(), icon: Users, accent: "info" },
        ]}
        primaryAction={{
          label: "Add Rescue Team",
          icon: Plus,
          onClick: () => setCreateOpen(true),
        }}
        filters={["All", "Approved", "Pending", "Rejected"]}
        tableTitle="Teams"
        tableCols={[
          { key: "name", label: "Team", render: r => <span className="text-sm font-medium">{r.name}</span> },
          { key: "region", label: "Region" },
          { key: "specialty", label: "Specialty" },
          { key: "lead", label: "Responder" },
          { key: "members", label: "Experience (yrs)" },
          { key: "vehicles", label: "Vehicles" },
          { key: "readiness", label: "Status", render: r => <PillBadge tone={r.readiness === "approved" ? "success" : r.readiness === "pending" ? "warning" : "emergency"}>{r.readiness}</PillBadge> },
        ]}
        tableRows={teams}
      />

      <CreateUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        role="rescue"
        onSuccess={fetchTeams}
      />
    </>
  );
}
