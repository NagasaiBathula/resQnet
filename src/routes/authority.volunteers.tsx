import { createFileRoute } from "@tanstack/react-router";
import { FeaturePage, PillBadge } from "@/components/feature-page";
import { Users, Award, Heart, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { CreateUserDialog } from "@/components/create-user-dialog";
import { API_URL } from "@/lib/config";
import { toast } from "sonner";

export const Route = createFileRoute("/authority/volunteers")({
  head: () => ({ meta: [{ title: "Volunteers — ResQNet" }] }),
  component: VolunteersPage,
});

function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("resqnet.token");
      const res = await fetch(`${API_URL}/api/users?role=volunteer`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch volunteers");
      }
      const data = await res.json();

      const mapped = data.map((u: any) => ({
        id: u._id || u.id,
        code: `VOL-${(u._id || u.id).slice(-4).toUpperCase()}`,
        name: u.name,
        region: `${u.district}, ${u.state}`,
        missions: u.completedMissionsCount ?? 0,
        rating: "4.8",
        skills: u.skills && u.skills.length > 0 ? u.skills.join(", ") : "General Support",
        status: u.status,
      }));
      setVolunteers(mapped);
    } catch (error) {
      console.error(error);
      toast.error("Error loading volunteers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  return (
    <>
      <FeaturePage
        title="Volunteer network"
        subtitle="Recruitment, skills, and engagement at a glance."
        stats={[
          {
            label: "Volunteers",
            value: volunteers.length.toString(),
            sublabel: "Registered",
            icon: Users,
            accent: "primary",
          },
          {
            label: "Active this month",
            value: volunteers.filter((v) => v.status === "approved").length.toString(),
            icon: Heart,
            accent: "success",
          },
          {
            label: "Certified",
            value: volunteers
              .filter(
                (v) =>
                  v.skills.toLowerCase().includes("aid") ||
                  v.skills.toLowerCase().includes("rescue"),
              )
              .length.toString(),
            sublabel: "first aid + above",
            icon: Award,
            accent: "info",
          },
          { label: "Avg rating", value: "4.8", icon: Award, accent: "warning" },
        ]}
        primaryAction={{
          label: "Add Volunteer",
          icon: Plus,
          onClick: () => setCreateOpen(true),
        }}
        filters={["All", "Approved", "Pending", "Rejected"]}
        tableTitle="Roster"
        tableCols={[
          {
            key: "code",
            label: "ID",
            render: (r) => <span className="font-mono text-xs">{r.code}</span>,
          },
          {
            key: "name",
            label: "Name",
            render: (r) => <span className="text-sm font-medium">{r.name}</span>,
          },
          { key: "region", label: "Region" },
          { key: "missions", label: "Missions" },
          {
            key: "rating",
            label: "Rating",
            render: (r) => <span className="text-xs">★ {r.rating}</span>,
          },
          { key: "skills", label: "Skills" },
          {
            key: "status",
            label: "Status",
            render: (r) => (
              <PillBadge
                tone={
                  r.status === "approved"
                    ? "success"
                    : r.status === "pending"
                      ? "warning"
                      : "emergency"
                }
              >
                {r.status}
              </PillBadge>
            ),
          },
        ]}
        tableRows={volunteers}
      />

      <CreateUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        role="volunteer"
        onSuccess={fetchVolunteers}
      />
    </>
  );
}
