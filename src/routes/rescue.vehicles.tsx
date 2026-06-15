import { createFileRoute } from "@tanstack/react-router";
import { FeaturePage, PillBadge } from "@/components/feature-page";
import { Truck, Fuel, MapPin, Wrench, Plus } from "lucide-react";

const vehicles = Array.from({ length: 22 }).map((_, i) => ({
  id: `v-${i+1}`,
  callsign: `RNV-${1000 + i}`,
  type: ["Ambulance","Fire Engine","Rescue Boat","Drone","K9 Van","Heavy Lift"][i%6],
  driver: ["Aarav S.","Priya P.","Vikram K.","Meera I.","Rohan M.","Sara T."][i%6],
  region: ["Mumbai","Chennai","Delhi","Pune","Kochi","Bengaluru"][i%6],
  status: (["en-route","idle","servicing","on-site","idle","en-route"] as const)[i%6],
  fuel: 30 + (i*13)%70,
  eta: i%3 === 0 ? `${5+(i%18)} min` : "—",
}));

export const Route = createFileRoute("/rescue/vehicles")({
  head: () => ({ meta: [{ title: "Vehicle Tracking — ResQNet" }] }),
  component: () => (
    <FeaturePage
      title="Vehicle tracking"
      subtitle="Live fleet positions, fuel, and assignment status."
      stats={[
        { label: "Fleet size", value: "84", sublabel: "22 active now", icon: Truck, accent: "primary" },
        { label: "En route", value: "12", sublabel: "avg ETA 8m", icon: MapPin, accent: "warning" },
        { label: "Avg fuel", value: "68%", sublabel: "3 below 30%", icon: Fuel, accent: "info" },
        { label: "In service", value: "6", sublabel: "2 awaiting parts", icon: Wrench, accent: "muted" as any },
      ]}
      primaryAction={{ label: "Add vehicle", icon: Plus }}
      filters={["All", "Ambulance", "Fire", "Boat", "Drone"]}
      tableTitle="Fleet"
      tableCols={[
        { key: "callsign", label: "Callsign", render: r => <span className="font-mono text-xs">{r.callsign}</span> },
        { key: "type", label: "Type" },
        { key: "driver", label: "Driver" },
        { key: "region", label: "Region" },
        { key: "status", label: "Status", render: r => <PillBadge tone={r.status === "on-site" ? "warning" : r.status === "en-route" ? "info" : r.status === "servicing" ? "muted" : "success"}>{r.status}</PillBadge> },
        { key: "fuel", label: "Fuel", render: r => <span className={r.fuel < 30 ? "text-emergency text-xs font-medium" : "text-xs"}>{r.fuel}%</span> },
        { key: "eta", label: "ETA" },
      ]}
      tableRows={vehicles}
      progressTitle="Maintenance queue"
      progressRows={[
        { label: "RNV-1008 · Brake check", value: 80, sub: "due Fri" },
        { label: "RNV-1012 · Tyre rotation", value: 45, sub: "scheduled" },
        { label: "RNV-1020 · Engine service", value: 25, sub: "parts ETA 2d" },
        { label: "RNV-1003 · Annual inspection", value: 90, sub: "tomorrow" },
      ]}
    />
  ),
});
