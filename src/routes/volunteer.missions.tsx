import { createFileRoute } from "@tanstack/react-router";
import { FeaturePage, PillBadge } from "@/components/feature-page";
import { Compass, MapPin, Clock, Plus, Filter } from "lucide-react";
import { missions } from "@/lib/mock-data";

const rows = missions.slice(0, 20);

export const Route = createFileRoute("/volunteer/missions")({
  head: () => ({ meta: [{ title: "Missions — ResQNet" }] }),
  component: () => (
    <FeaturePage
      title="Available missions"
      subtitle="Nearby opportunities matched to your skills."
      stats={[
        {
          label: "Open missions",
          value: "18",
          sublabel: "near you",
          icon: Compass,
          accent: "primary",
        },
        { label: "Within 5 km", value: "7", icon: MapPin, accent: "info" },
        { label: "Avg duration", value: "2h 40m", icon: Clock, accent: "success" },
        {
          label: "Reward pool",
          value: "₹14,250",
          sublabel: "this week",
          icon: Plus,
          accent: "warning",
        },
      ]}
      filters={["All", "Available", "High priority", "Within 5 km", "Medical", "Logistics"]}
      tableTitle="Missions"
      tableCols={[
        {
          key: "title",
          label: "Mission",
          render: (r) => <span className="text-sm font-medium">{r.title}</span>,
        },
        { key: "location", label: "Location" },
        {
          key: "priority",
          label: "Priority",
          render: (r) => (
            <PillBadge
              tone={
                r.priority === "critical" ? "emergency" : r.priority === "high" ? "warning" : "info"
              }
            >
              {r.priority}
            </PillBadge>
          ),
        },
        {
          key: "distanceKm",
          label: "Distance",
          render: (r) => <span className="text-xs">{r.distanceKm} km</span>,
        },
        { key: "estDuration", label: "Duration" },
        {
          key: "volunteersAssigned",
          label: "Team",
          render: (r) => (
            <span className="text-xs">
              {r.volunteersAssigned}/{r.volunteersNeeded}
            </span>
          ),
        },
        {
          key: "reward",
          label: "Reward",
          render: (r) => <span className="text-xs font-medium">₹{r.reward}</span>,
        },
        {
          key: "status",
          label: "Status",
          render: (r) => (
            <PillBadge
              tone={
                r.status === "available"
                  ? "success"
                  : r.status === "completed"
                    ? "muted"
                    : "warning"
              }
            >
              {r.status}
            </PillBadge>
          ),
        },
      ]}
      tableRows={rows}
    />
  ),
});
