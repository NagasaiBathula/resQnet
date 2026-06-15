import { createFileRoute } from "@tanstack/react-router";
import { FeaturePage, PillBadge } from "@/components/feature-page";
import { Radio, Headphones, PhoneCall, Plus, Activity, AlertTriangle } from "lucide-react";

const channels = [
  { id: "ch-1", name: "Alpha Channel", team: "Alpha Squad", listeners: 12, status: "live", region: "Mumbai", quality: "HD" },
  { id: "ch-2", name: "Bravo Channel", team: "Bravo Squad", listeners: 8, status: "live", region: "Chennai", quality: "HD" },
  { id: "ch-3", name: "Marine Ops", team: "Charlie Marine", listeners: 5, status: "standby", region: "Kochi", quality: "SD" },
  { id: "ch-4", name: "Medical Net", team: "Delta Medical", listeners: 14, status: "live", region: "Delhi", quality: "HD" },
  { id: "ch-5", name: "Authority Bridge", team: "NDMA", listeners: 22, status: "live", region: "National", quality: "HD" },
  { id: "ch-6", name: "Volunteer Net", team: "Civilian Aux", listeners: 64, status: "live", region: "Pan-India", quality: "SD" },
  { id: "ch-7", name: "Air Support", team: "Echo Aviation", listeners: 3, status: "standby", region: "Bengaluru", quality: "HD" },
  { id: "ch-8", name: "Logistics", team: "Foxtrot Supply", listeners: 9, status: "live", region: "Hyderabad", quality: "HD" },
];

const dispatches = Array.from({ length: 14 }).map((_, i) => ({
  id: `d-${i+1}`,
  caseId: `CC-${2510 + i}`,
  team: ["Alpha-1","Bravo-2","Charlie-3","Delta-1","Echo-2"][i%5],
  units: ["2 ambulances","Boat + 4 medics","Fire engine","Drone unit","K9 team"][i%5],
  destination: ["Sector 12, Mumbai","Sector 7, Chennai","Old Town, Pune","Marine Drive, Mumbai","Tech Park, Bengaluru"][i%5],
  eta: `${4 + (i%12)} min`,
  priority: (["critical","high","medium","high","critical"] as const)[i%5],
}));

export const Route = createFileRoute("/rescue/dispatch")({
  head: () => ({ meta: [{ title: "Dispatch Center — ResQNet" }] }),
  component: () => (
    <FeaturePage
      title="Dispatch center"
      subtitle="Assign teams and resources to live incidents in real time."
      stats={[
        { label: "Open channels", value: "8", sublabel: "5 live · 3 standby", icon: Radio, accent: "primary" },
        { label: "Dispatched units", value: "31", sublabel: "12 en route", icon: AlertTriangle, accent: "warning" },
        { label: "Operators online", value: "14", sublabel: "shift A", icon: Headphones, accent: "info" },
        { label: "Call volume", value: "1,284", sublabel: "today", icon: PhoneCall, accent: "success" },
      ]}
      primaryAction={{ label: "New dispatch", icon: Plus }}
      extraActions={[{ label: "Open comms", icon: Radio }]}
      tableTitle="Active dispatches"
      filters={["All", "Critical", "High", "Medium"]}
      tableCols={[
        { key: "caseId", label: "Case", render: r => <span className="font-mono text-xs">{r.caseId}</span> },
        { key: "team", label: "Team", render: r => <span className="text-sm font-medium">{r.team}</span> },
        { key: "units", label: "Units", render: r => <span className="text-xs text-muted-foreground">{r.units}</span> },
        { key: "destination", label: "Destination" },
        { key: "priority", label: "Priority", render: r => <PillBadge tone={r.priority === "critical" ? "emergency" : r.priority === "high" ? "warning" : "info"}>{r.priority}</PillBadge> },
        { key: "eta", label: "ETA", render: r => <span className="text-xs font-medium">{r.eta}</span> },
      ]}
      tableRows={dispatches}
      sideCards={[
        { title: "Channels", items: channels.slice(0,6).map(c => ({
          label: `${c.name} · ${c.region}`,
          value: <PillBadge tone={c.status === "live" ? "success" : "muted"}>{c.listeners} on</PillBadge>,
        })) },
        { title: "Operators on duty", items: [
          { label: "Sarah Chen", value: <PillBadge tone="success">Active</PillBadge> },
          { label: "Marco Diaz", value: <PillBadge tone="success">Active</PillBadge> },
          { label: "Priya Iyer", value: <PillBadge tone="warning">On call</PillBadge> },
          { label: "Tomás Reyes", value: <PillBadge tone="success">Active</PillBadge> },
        ]},
      ]}
    />
  ),
});
