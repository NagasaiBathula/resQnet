import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { StatCard, SectionTitle } from "@/components/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Activity, Server, ShieldCheck, Cpu, Database } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin — ResQNet" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <AppShell title="System overview">
      <p className="text-muted-foreground -mt-1 mb-6">Platform health, users, and ops · everything you need at a glance.</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total users" value="14,284" sublabel="+184 today" icon={Users} accent="primary" />
        <StatCard label="Daily active" value="6,210" sublabel="43% engagement" icon={Activity} accent="success" />
        <StatCard label="Uptime" value="99.98%" sublabel="last 30 days" icon={Server} accent="info" />
        <StatCard label="Security" value="A+" sublabel="all checks pass" icon={ShieldCheck} accent="warning" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-6">
        <Card>
          <CardContent className="p-5">
            <SectionTitle title="System health" />
            <ul className="space-y-4">
              {[
                { icon: Cpu, t: "API gateway", p: 32, v: "32% CPU" },
                { icon: Database, t: "Primary DB", p: 58, v: "58% load" },
                { icon: Server, t: "Edge workers", p: 21, v: "21% capacity" },
                { icon: Activity, t: "Realtime channel", p: 44, v: "44% sockets" },
              ].map(r => (
                <li key={r.t}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="flex items-center gap-2"><r.icon className="h-4 w-4 text-muted-foreground" />{r.t}</span>
                    <span className="text-xs text-muted-foreground">{r.v}</span>
                  </div>
                  <Progress value={r.p} className="h-1.5" />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <SectionTitle title="Recent admin activity" />
            <ul className="space-y-3 text-sm">
              {[
                "Granted Authority role to Dr. Anita Rao",
                "Rotated API key for Edge worker pool",
                "Updated rate limits on /sos endpoint",
                "Approved 12 new volunteer applications",
                "Published v2.4 release notes",
              ].map((t, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="flex-1">{t}</span>
                  <span className="text-xs text-muted-foreground">{i + 1}h ago</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
