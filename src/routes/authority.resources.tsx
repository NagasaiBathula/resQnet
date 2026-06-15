import { createFileRoute } from "@tanstack/react-router";
import { FeaturePage, PillBadge } from "@/components/feature-page";
import { Boxes, Truck, HeartPulse, Droplet, Plus } from "lucide-react";

const allocations = Array.from({ length: 18 }).map((_, i) => ({
  id: `a-${i+1}`,
  region: ["Mumbai","Chennai","Delhi","Pune","Kochi","Bengaluru","Hyderabad","Jaipur","Kolkata"][i%9],
  category: ["Medical","Food","Water","Shelter","Comms","Tools"][i%6],
  allocated: 200 + (i*53)%800,
  used: 100 + (i*37)%500,
  par: 1000,
  status: ["ok","ok","low","ok","critical","ok","ok","low","ok"][i%9],
}));

export const Route = createFileRoute("/authority/resources")({
  head: () => ({ meta: [{ title: "Resource Allocation — ResQNet" }] }),
  component: () => (
    <FeaturePage
      title="Resource allocation"
      subtitle="National stockpiles and regional distribution."
      stats={[
        { label: "Categories", value: "12", icon: Boxes, accent: "primary" },
        { label: "Convoys today", value: "28", icon: Truck, accent: "info" },
        { label: "Medical units shipped", value: "4,820", icon: HeartPulse, accent: "emergency" },
        { label: "Water (kL)", value: "1,240", icon: Droplet, accent: "success" },
      ]}
      primaryAction={{ label: "New allocation", icon: Plus }}
      filters={["All", "Critical", "Low", "OK"]}
      tableTitle="Allocations"
      tableCols={[
        { key: "region", label: "Region" },
        { key: "category", label: "Category" },
        { key: "allocated", label: "Allocated" },
        { key: "used", label: "Used" },
        { key: "par", label: "Par" },
        { key: "status", label: "Status", render: r => <PillBadge tone={r.status === "critical" ? "emergency" : r.status === "low" ? "warning" : "success"}>{r.status}</PillBadge> },
      ]}
      tableRows={allocations}
      progressTitle="Regional stockpile health"
      progressRows={[
        { label: "Mumbai depot", value: 78, sub: "78% of par" },
        { label: "Chennai depot", value: 62 },
        { label: "Delhi depot", value: 88 },
        { label: "Bengaluru depot", value: 45 },
      ]}
    />
  ),
});
