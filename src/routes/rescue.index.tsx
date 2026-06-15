import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatCard, SectionTitle, typeIcon, typeColor, SeverityBadge, StatusBadge, mapCategoryToKey } from "@/components/shared";
import { AlertTriangle, Activity, Truck, Radio, Users, Search, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { analytics } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { incidentService } from "@/services/incidentService";
import { IncidentDetailsDialog } from "@/components/incident-details-dialog";

export const Route = createFileRoute("/rescue/")({
  head: () => ({ meta: [{ title: "Rescue Command Center — ResQNet" }] }),
  component: RescueDashboard,
});

function RescueDashboard() {
  const [incidentsList, setIncidentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchIncidents = () => {
    setLoading(true);
    incidentService
      .getMyIncidents()
      .then((data) => {
        setIncidentsList(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading rescue index incidents:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleInspect = (inc: any) => {
    setSelectedIncident(inc);
    setDialogOpen(true);
  };

  // Stats computation
  const activeIncidents = incidentsList.filter(i => i.status !== "Resolved");
  const activeCount = activeIncidents.length;
  const criticalCount = activeIncidents.filter(
    (i) => i.severity === "critical" || i.severity === "High" || i.severity === "Critical"
  ).length;

  const queue = activeIncidents
    .filter((i) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        i.incidentNumber?.toLowerCase().includes(term) ||
        i.title?.toLowerCase().includes(term) ||
        i.category?.toLowerCase().includes(term) ||
        (i.address || `${i.district}, ${i.state}`).toLowerCase().includes(term)
      );
    })
    .slice(0, 6);

  return (
    <AppShell title="Command center" actions={
      <>
        <Button variant="outline" className="rounded-full"><Radio className="h-4 w-4 mr-1.5" />Open comms</Button>
        <Button className="rounded-full shadow-glow" asChild><Link to="/rescue/incidents"><Truck className="h-4 w-4 mr-1.5" />Active Queue</Link></Button>
      </>
    }>
      <p className="text-muted-foreground -mt-1 mb-6">{activeCount} active incidents · 4 teams deployed · system nominal</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Active incidents" value={activeCount.toString()} sublabel={`${criticalCount} critical`} icon={AlertTriangle} accent="emergency" delay={0} />
        <StatCard label="Teams deployed" value="4 / 8" sublabel="4 on standby" icon={Truck} accent="primary" delay={0.05} />
        <StatCard label="Avg response" value="8m 42s" sublabel="−12% vs target" icon={Activity} accent="success" delay={0.1} />
        <StatCard label="Personnel" value="74" sublabel="62 on duty" icon={Users} accent="info" delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <SectionTitle title="Priority queue" action={
              <Button asChild size="sm" variant="ghost"><Link to="/rescue/incidents">Open all</Link></Button>
            } />
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search case ID, type, or location…"
                className="pl-9 h-10 bg-muted/40 border-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground text-sm">Loading dispatch queue...</div>
              ) : queue.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">No active incidents in queue</div>
              ) : (
                queue.map((i) => {
                  const catKey = mapCategoryToKey(i.category);
                  const Icon = typeIcon[catKey] || AlertTriangle;
                  return (
                    <div
                      key={i._id}
                      onClick={() => handleInspect(i)}
                      className="block cursor-pointer"
                    >
                      <motion.div whileHover={{ x: 2 }} className="rounded-xl border p-3 hover:bg-accent/40 transition">
                        <div className="flex items-center gap-3">
                          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", typeColor[catKey] || "bg-primary/10 text-primary")}><Icon className="h-5 w-5" /></div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-muted-foreground">{i.incidentNumber}</span>
                              <span className="text-sm font-semibold truncate">{i.title}</span>
                            </div>
                            <div className="text-xs text-muted-foreground truncate">{i.address || `${i.district}, ${i.state}`} · reported by {i.reportedBy?.name || "Citizen"}</div>
                          </div>
                          <div className="hidden md:flex items-center gap-2 shrink-0">
                            <SeverityBadge severity={i.severity} />
                            <StatusBadge status={i.status} />
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full shrink-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <SectionTitle title="Resource availability" />
            <ul className="space-y-3 text-sm">
              {[
                { t: "Boats", a: 6, total: 10 },
                { t: "Ambulances", a: 8, total: 12 },
                { t: "Drones", a: 4, total: 6 },
                { t: "Medical kits", a: 142, total: 200 },
                { t: "Comms units", a: 22, total: 30 },
              ].map(r => (
                <li key={r.t} className="flex items-center justify-between gap-3">
                  <span>{r.t}</span>
                  <div className="flex items-center gap-2 min-w-[180px]">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${(r.a / r.total) * 100}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-14 text-right">{r.a}/{r.total}</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardContent className="p-5">
          <SectionTitle title="Regional load" />
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={analytics.regional}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="city" fontSize={11} stroke="currentColor" opacity={0.5} />
                <YAxis fontSize={11} stroke="currentColor" opacity={0.5} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)" }} />
                <Bar dataKey="incidents" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {selectedIncident && (
        <IncidentDetailsDialog
          incident={selectedIncident}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onUpdate={fetchIncidents}
        />
      )}
    </AppShell>
  );
}
