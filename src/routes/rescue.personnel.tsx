import { createFileRoute } from "@tanstack/react-router";
import { FeaturePage, PillBadge } from "@/components/feature-page";
import { Users, Award, Clock, Plus } from "lucide-react";

const personnel = Array.from({ length: 28 }).map((_, i) => ({
  id: `p-${i + 1}`,
  code: `RN-${4001 + i}`,
  name: [
    "Aarav Sharma",
    "Priya Patel",
    "Cmdr. Rohan Mehta",
    "Meera Iyer",
    "Vikram Singh",
    "Sara Thomas",
    "Karan Kapoor",
    "Anjali Roy",
  ][i % 8],
  role: [
    "Field medic",
    "Boat operator",
    "Squad leader",
    "Drone pilot",
    "K9 handler",
    "Logistics",
    "Comms officer",
    "Firefighter",
  ][i % 8],
  team: `Alpha-${(i % 8) + 1}`,
  region: ["Mumbai", "Chennai", "Delhi", "Pune", "Kochi", "Bengaluru", "Hyderabad", "Jaipur"][
    i % 8
  ],
  shift: ["Day", "Night", "Day", "Night", "On call", "Day", "Night", "Day"][i % 8],
  status: (
    [
      "on-duty",
      "on-duty",
      "off-duty",
      "training",
      "on-duty",
      "on-call",
      "on-duty",
      "off-duty",
    ] as const
  )[i % 8],
  rank: ["Senior", "Lead", "Captain", "Specialist", "Officer", "Senior", "Lead", "Officer"][i % 8],
}));

export const Route = createFileRoute("/rescue/personnel")({
  head: () => ({ meta: [{ title: "Personnel — ResQNet" }] }),
  component: () => (
    <FeaturePage
      title="Personnel"
      subtitle="Roster, certifications, and shift coverage."
      stats={[
        {
          label: "Total personnel",
          value: "182",
          sublabel: "across 28 teams",
          icon: Users,
          accent: "primary",
        },
        {
          label: "On duty",
          value: "118",
          sublabel: "65% coverage",
          icon: Clock,
          accent: "success",
        },
        { label: "Certified medics", value: "47", icon: Award, accent: "info" },
        { label: "In training", value: "12", icon: Award, accent: "warning" },
      ]}
      primaryAction={{ label: "Add member", icon: Plus }}
      filters={["All", "On duty", "Off duty", "Training", "On call"]}
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
        { key: "role", label: "Role" },
        { key: "team", label: "Team" },
        { key: "region", label: "Region" },
        { key: "shift", label: "Shift" },
        {
          key: "status",
          label: "Status",
          render: (r) => (
            <PillBadge
              tone={
                r.status === "on-duty"
                  ? "success"
                  : r.status === "training"
                    ? "info"
                    : r.status === "on-call"
                      ? "warning"
                      : "muted"
              }
            >
              {r.status}
            </PillBadge>
          ),
        },
        { key: "rank", label: "Rank" },
      ]}
      tableRows={personnel}
      sideCards={[
        {
          title: "Shift coverage",
          items: [
            { label: "Day shift", value: <PillBadge tone="success">82 / 90</PillBadge> },
            { label: "Night shift", value: <PillBadge tone="warning">36 / 50</PillBadge> },
            { label: "On call", value: <PillBadge tone="info">14</PillBadge> },
          ],
        },
      ]}
    />
  ),
});
