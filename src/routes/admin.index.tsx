import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { StatCard, SectionTitle } from "@/components/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Activity,
  ShieldAlert,
  Boxes,
  Shield,
  ArrowRight,
    Cpu,
  Database,
  Server,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { incidentService } from "@/services/incidentService";
import { resourceService } from "@/services/resourceService";
import { API_URL } from "@/lib/config";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin Overview — ResQNet" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("resqnet.token");
        const headers = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        const [usersRes, incData, resData] = await Promise.all([
          fetch(`${API_URL}/api/users`, { headers }),
          incidentService.getIncidents(),
          resourceService.getResources(),
        ]);

        if (usersRes.ok) {
          const uData = await usersRes.json();
          setUsersList(Array.isArray(uData) ? uData : []);
        }
        setIncidents(incData);
        setResources(resData);
      } catch (err) {
        console.error("Error fetching admin dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const totalUsers = usersList.length;
  const activeIncidents = incidents.filter((i) => i.status !== "Resolved").length;
  const authorityCount = usersList.filter((u) => u.role === "authority").length;
  const totalResources = resources.length;

  return (
    <AppShell title="System Administration Overview">
      <p className="text-muted-foreground -mt-1 mb-6">
        Platform telemetry, user permissions, and deployment status. Audit database metrics and manage regional configurations.
      </p>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={loading ? "..." : String(totalUsers)}
          sublabel="All registered accounts"
          icon={Users}
          accent="primary"
          delay={0}
        />
        <StatCard
          label="Active Incidents"
          value={loading ? "..." : String(activeIncidents)}
          sublabel="Ongoing operations"
          icon={ShieldAlert}
          accent="emergency"
          delay={0.05}
        />
        <StatCard
          label="Authorities"
          value={loading ? "..." : String(authorityCount)}
          sublabel="Regional command units"
          icon={Shield}
          accent="warning"
          delay={0.1}
        />
        <StatCard
          label="Global Stockpiles"
          value={loading ? "..." : String(totalResources)}
          sublabel="Registered items"
          icon={Boxes}
          accent="success"
          delay={0.15}
        />
      </div>

      {/* Admin Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
        <Button asChild variant="outline" className="rounded-xl h-12 flex justify-start gap-3">
          <Link to="/admin/users">
            <Users className="h-5 w-5 text-primary shrink-0" />
            <div className="text-left">
              <div className="font-bold text-xs">Manage Users</div>
              <div className="text-[10px] text-muted-foreground">Volunteers, Citizens & Rescue</div>
            </div>
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-xl h-12 flex justify-start gap-3">
          <Link to="/admin/authorities">
            <Shield className="h-5 w-5 text-warning shrink-0" />
            <div className="text-left">
              <div className="font-bold text-xs">Manage Authorities</div>
              <div className="text-[10px] text-muted-foreground">Command Center Controls</div>
            </div>
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-xl h-12 flex justify-start gap-3">
          <Link to="/admin/resources">
            <Boxes className="h-5 w-5 text-success shrink-0" />
            <div className="text-left">
              <div className="font-bold text-xs">Global Stockpile</div>
              <div className="text-[10px] text-muted-foreground">Inventory & Assignments</div>
            </div>
          </Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-6">
        {/* Telemetry Metrics */}
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-5">
            <SectionTitle title="System Node Performance" />
            <ul className="space-y-4 mt-4">
              {[
                { icon: Cpu, t: "API Gateway Node", p: 24, v: "24% CPU load" },
                { icon: Database, t: "Mongoose Cluster Atlas", p: 18, v: "18% CPU load" },
                { icon: Server, t: "Asset Delivery Server", p: 12, v: "12% bandwidth" },
                { icon: Activity, t: "Socket.IO Signal Network", p: 5, v: "5 active sockets" },
              ].map((r) => (
                <li key={r.t}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="flex items-center gap-2">
                      <r.icon className="h-4 w-4 text-muted-foreground" />
                      {r.t}
                    </span>
                    <span className="text-xs text-muted-foreground">{r.v}</span>
                  </div>
                  <Progress value={r.p} className="h-1.5" />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Settings Overview */}
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-5">
            <SectionTitle
              title="System Configuration Brief"
              action={
                <Button asChild size="sm" variant="ghost" className="text-xs">
                  <Link to="/admin/settings">Edit Settings <ArrowRight className="h-3 w-3 ml-1" /></Link>
                </Button>
              }
            />
            <ul className="space-y-3 text-xs mt-4">
              <li className="flex items-center justify-between py-1 border-b">
                <span className="text-muted-foreground">Database Provider</span>
                <span className="font-semibold text-foreground font-mono">MongoDB Atlas</span>
              </li>
              <li className="flex items-center justify-between py-1 border-b">
                <span className="text-muted-foreground">API Node Status</span>
                <span className="text-success font-semibold">Healthy (99.98% uptime)</span>
              </li>
              <li className="flex items-center justify-between py-1 border-b">
                <span className="text-muted-foreground">Asset Sync Engine</span>
                <span className="text-foreground">IndexedDB Enabled</span>
              </li>
              <li className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">Gemini API Layer</span>
                <span className="text-success font-semibold">Activated (Vision v1.5)</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
