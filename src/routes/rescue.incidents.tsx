import { createFileRoute } from "@tanstack/react-router";
import { FeaturePage, PillBadge } from "@/components/feature-page";
import { AlertTriangle, Truck, Radio, Users, Clock, MapPin, Plus, Activity } from "lucide-react";
import { incidents } from "@/lib/mock-data";
import { SeverityBadge, StatusBadge, typeIcon, typeColor } from "@/components/shared";
import { cn } from "@/lib/utils";

const rows = incidents.slice(0, 24);

export const Route = createFileRoute("/rescue/incidents")({
  head: () => ({ meta: [{ title: "Active Incidents — ResQNet" }] }),
  component: () => (
    <FeaturePage
      title="Active incidents"
      subtitle="Triage queue, severity, and team assignments across all regions."
      stats={[
        { label: "Active", value: "47", sublabel: "+6 last hour", icon: AlertTriangle, accent: "emergency" },
        { label: "Dispatched", value: "31", sublabel: "12 en route", icon: Truck, accent: "primary" },
        { label: "Avg triage", value: "1m 12s", sublabel: "−24% wow", icon: Clock, accent: "success" },
        { label: "Personnel", value: "182", sublabel: "across 28 teams", icon: Users, accent: "info" },
      ]}
      filters={["All severities", "Critical", "High", "Medium", "Low"]}
      primaryAction={{ label: "Create incident", icon: Plus }}
      extraActions={[{ label: "Open comms", icon: Radio }]}
      tableTitle="Priority queue"
      tableCols={[
        { key: "caseId", label: "Case", render: r => <span className="font-mono text-xs">{r.caseId}</span> },
        { key: "type", label: "Type", render: r => {
            const I = typeIcon[r.type as keyof typeof typeIcon];
            return <span className="inline-flex items-center gap-2"><span className={cn("h-7 w-7 rounded-lg grid place-items-center", typeColor[r.type as keyof typeof typeColor])}><I className="h-3.5 w-3.5"/></span><span className="capitalize text-sm">{r.type}</span></span>;
          }},
        { key: "title", label: "Title", render: r => <span className="text-sm font-medium">{r.title}</span> },
        { key: "location", label: "Location", render: r => <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><MapPin className="h-3 w-3"/>{r.location}</span> },
        { key: "severity", label: "Severity", render: r => <SeverityBadge severity={r.severity}/> },
        { key: "status", label: "Status", render: r => <StatusBadge status={r.status}/> },
        { key: "eta", label: "ETA", render: r => <span className="text-xs">{r.eta ?? "—"}</span> },
      ]}
      tableRows={rows}
      progressTitle="Team availability"
      progressRows={[
        { label: "Alpha Squad", value: 6, max: 8, sub: "6 / 8 deployed" },
        { label: "Bravo Squad", value: 4, max: 8, sub: "4 / 8 deployed" },
        { label: "Charlie Marine", value: 3, max: 5, sub: "3 / 5 boats out" },
        { label: "Delta Medical", value: 7, max: 10, sub: "7 / 10 active" },
      ]}
      sideCards={[
        { title: "Live SLA", items: [
          { label: "Critical response", value: <PillBadge tone="success">4m 30s</PillBadge> },
          { label: "High response", value: <PillBadge tone="success">8m 12s</PillBadge> },
          { label: "Medium response", value: <PillBadge tone="warning">22m 04s</PillBadge> },
          { label: "Resolved today", value: "184" },
        ]},
      ]}
    />
  ),
});
