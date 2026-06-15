import { createFileRoute } from "@tanstack/react-router";
import { FeaturePage, PillBadge } from "@/components/feature-page";
import { Activity, Server, Database, Cpu, Cloud } from "lucide-react";

const data = Array.from({ length: 24 }).map((_, i) => ({
  t: `${i}:00`,
  api: 30 + ((i*13)%50),
  db: 40 + ((i*17)%40),
  edge: 15 + ((i*9)%30),
}));

const services = [
  { id: "s-1", name: "API Gateway", region: "ap-south-1", uptime: "99.99%", p95: "82ms", status: "operational" },
  { id: "s-2", name: "Primary DB", region: "ap-south-1", uptime: "99.98%", p95: "12ms", status: "operational" },
  { id: "s-3", name: "Read replica EU", region: "eu-west-1", uptime: "99.97%", p95: "18ms", status: "operational" },
  { id: "s-4", name: "Edge workers", region: "global", uptime: "100%", p95: "9ms", status: "operational" },
  { id: "s-5", name: "Realtime channel", region: "ap-south-1", uptime: "99.95%", p95: "22ms", status: "degraded" },
  { id: "s-6", name: "AI inference", region: "us-east-1", uptime: "99.92%", p95: "184ms", status: "operational" },
  { id: "s-7", name: "Object storage", region: "ap-south-1", uptime: "100%", p95: "28ms", status: "operational" },
  { id: "s-8", name: "SMS gateway", region: "global", uptime: "99.81%", p95: "612ms", status: "operational" },
];

export const Route = createFileRoute("/admin/health")({
  head: () => ({ meta: [{ title: "System Health — ResQNet" }] }),
  component: () => (
    <FeaturePage
      title="System health"
      subtitle="Live infrastructure status, capacity, and incidents."
      stats={[
        { label: "Uptime (30d)", value: "99.98%", icon: Activity, accent: "success" },
        { label: "Active edges", value: "184", sublabel: "32 regions", icon: Cloud, accent: "primary" },
        { label: "DB load", value: "58%", icon: Database, accent: "info" },
        { label: "CPU avg", value: "32%", icon: Cpu, accent: "warning" },
      ]}
      charts={[
        { title: "Load (% capacity) by service · 24h", type: "area", data, xKey: "t", series: [
          { key: "api", label: "API" }, { key: "db", label: "DB" }, { key: "edge", label: "Edge" }
        ]},
        { title: "Request volume · 24h", type: "bar", data: Array.from({length:12}).map((_,i)=>({ name: `${i*2}h`, value: 800+((i*97)%600)})) , series: [{key:"value"}] },
      ]}
      tableTitle="Services"
      tableCols={[
        { key: "name", label: "Service", render: r => <span className="text-sm font-medium">{r.name}</span> },
        { key: "region", label: "Region" },
        { key: "uptime", label: "Uptime 30d" },
        { key: "p95", label: "p95 latency" },
        { key: "status", label: "Status", render: r => <PillBadge tone={r.status === "operational" ? "success" : r.status === "degraded" ? "warning" : "emergency"}>{r.status}</PillBadge> },
      ]}
      tableRows={services}
      sideCards={[
        { title: "Recent incidents", items: [
          { label: "SMS gateway latency spike", value: <PillBadge tone="success">Resolved</PillBadge> },
          { label: "EU replica failover drill", value: <PillBadge tone="muted">Scheduled</PillBadge> },
          { label: "Cache warm-up after deploy", value: <PillBadge tone="success">Resolved</PillBadge> },
        ]},
      ]}
    />
  ),
});
