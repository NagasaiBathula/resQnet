import { createFileRoute } from "@tanstack/react-router";
import { FeaturePage, PillBadge } from "@/components/feature-page";
import { Building2, Users, Bed, Plus } from "lucide-react";
import { shelters } from "@/lib/mock-data";

export const Route = createFileRoute("/authority/shelters")({
  head: () => ({ meta: [{ title: "Shelters — ResQNet" }] }),
  component: () => (
    <FeaturePage
      title="Shelter network"
      subtitle="Capacity, occupancy, and conditions across the network."
      stats={[
        { label: "Shelters", value: "284", sublabel: "24 cities", icon: Building2, accent: "primary" },
        { label: "Beds total", value: "42,180", icon: Bed, accent: "info" },
        { label: "Currently housed", value: "14,820", sublabel: "35% utilized", icon: Users, accent: "success" },
        { label: "Capacity warnings", value: "7", sublabel: ">85% full", icon: Users, accent: "warning" },
      ]}
      primaryAction={{ label: "Add shelter", icon: Plus }}
      filters={["All", "Open", "Limited", "Full"]}
      tableTitle="Shelters"
      tableCols={[
        { key: "name", label: "Shelter", render: r => <span className="text-sm font-medium">{r.name}</span> },
        { key: "city", label: "City" },
        { key: "capacity", label: "Capacity" },
        { key: "occupied", label: "Occupied", render: r => <span className="text-sm">{r.occupied} <span className="text-xs text-muted-foreground">({Math.round(r.occupied/r.capacity*100)}%)</span></span> },
        { key: "facilities", label: "Facilities", render: r => <span className="text-xs text-muted-foreground">{r.facilities.join(", ")}</span> },
        { key: "status", label: "Status", render: r => <PillBadge tone={r.status === "open" ? "success" : r.status === "limited" ? "warning" : "emergency"}>{r.status}</PillBadge> },
        { key: "contact", label: "Contact" },
      ]}
      tableRows={shelters}
    />
  ),
});
