import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { StatCard, SectionTitle } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {} from "@/components/ui/badge";
import {
  Activity,
        ArrowRight,
  PlusCircle,
  FileCheck,
  ClipboardList,
  Clock,
      Layers,
  History,
  AlertTriangle,
  Boxes,
} from "lucide-react";
import { useState, useEffect } from "react";
import { incidentService } from "@/services/incidentService";
import { resourceService } from "@/services/resourceService";
import { API_URL } from "@/lib/config";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/authority/")({
  head: () => ({ meta: [{ title: "Command Dashboard — ResQNet" }] }),
  component: AuthorityDashboard,
});

const chartMockData = [
  { month: "Jan", reported: 45, resolved: 32 },
  { month: "Feb", reported: 55, resolved: 48 },
  { month: "Mar", reported: 80, resolved: 65 },
  { month: "Apr", reported: 120, resolved: 95 },
  { month: "May", reported: 90, resolved: 85 },
  { month: "Jun", reported: 140, resolved: 110 },
];

function AuthorityDashboard() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [incList, resList] = await Promise.all([
          incidentService.getIncidents(),
          resourceService.getResources(),
        ]);
        setIncidents(incList);
        setResources(resList);

        // Fetch registration requests to count pending ones
        const token = localStorage.getItem("resqnet.token");
        const headers = {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
        const reqRes = await fetch(`${API_URL}/api/users/requests?status=pending`, { headers });
        if (reqRes.ok) {
          const reqs = await reqRes.json();
          setPendingApprovalsCount(Array.isArray(reqs) ? reqs.length : 0);
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute metrics
  const activeIncidents = incidents.filter((i) => i.status !== "Resolved");
  const criticalIncidents = activeIncidents.filter(
    (i) => i.severity?.toLowerCase() === "critical",
  );
  const availableResources = resources.filter((r) => r.status === "Available");

  // Compile combined activity feed
  const feedItems: any[] = [];
  incidents.forEach((inc) => {
    if (inc.activityLog) {
      inc.activityLog.forEach((log: any) => {
        feedItems.push({
          id: `inc-log-${inc._id}-${log.timestamp}`,
          type: "incident",
          incidentNumber: inc.incidentNumber,
          incidentTitle: inc.title,
          action: log.action,
          performedBy: log.performedBy?.name || "System",
          performedByRole: log.performedByRole,
          timestamp: new Date(log.timestamp),
          notes: log.notes,
        });
      });
    }
  });

  resources.forEach((res) => {
    if (res.resourceActivityLog) {
      res.resourceActivityLog.forEach((log: any) => {
        feedItems.push({
          id: `res-log-${res._id}-${log.timestamp}`,
          type: "resource",
          resourceId: res.resourceId,
          resourceName: res.name,
          action: log.action,
          performedBy: log.performedBy?.name || "System",
          performedByRole: log.performedByRole,
          timestamp: new Date(log.timestamp),
          notes: log.notes,
        });
      });
    }
  });

  // Sort and take top 5
  const sortedFeed = feedItems
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5);

  const fallbackFeed = [
    {
      id: "fb-1",
      type: "incident",
      incidentNumber: "INC-2026-0001",
      incidentTitle: "Heavy flooding reported near coastline",
      action: "Incident Created",
      performedBy: "Citizen Reporter",
      performedByRole: "citizen",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
    },
    {
      id: "fb-2",
      type: "incident",
      incidentNumber: "INC-2026-0001",
      incidentTitle: "Heavy flooding reported near coastline",
      action: "Incident Verified",
      performedBy: "Command Center Officer",
      performedByRole: "authority",
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
    },
    {
      id: "fb-3",
      type: "resource",
      resourceId: "RES-2026-0002",
      resourceName: "Emergency Generator Set #1",
      action: "Resource Created",
      performedBy: "Logistics Manager",
      performedByRole: "authority",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
    },
  ];

  const finalFeed = sortedFeed.length > 0 ? sortedFeed : fallbackFeed;

  return (
    <AppShell title="Authority Command Dashboard">
      <p className="text-muted-foreground -mt-1 mb-6">
        Emergency response operations control portal. Monitor crisis statuses, approve volunteer applications, and audit stockpiles.
      </p>

      {/* Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Incidents"
          value={loading ? "..." : String(activeIncidents.length)}
          sublabel="Under response"
          icon={Activity}
          accent="primary"
          delay={0}
        />
        <StatCard
          label="Critical Incidents"
          value={loading ? "..." : String(criticalIncidents.length)}
          sublabel="Immediate action needed"
          icon={AlertTriangle}
          accent="emergency"
          delay={0.05}
        />
        <StatCard
          label="Available Resources"
          value={loading ? "..." : String(availableResources.length)}
          sublabel="In regional stockpile"
          icon={Boxes}
          accent="success"
          delay={0.1}
        />
        <StatCard
          label="Pending Approvals"
          value={loading ? "..." : String(pendingApprovalsCount)}
          sublabel="Applications review"
          icon={FileCheck}
          accent="warning"
          delay={0.15}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6 mt-6">
        {/* Left Side: Recent Trends and Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="p-5 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" /> Command Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button asChild className="rounded-xl h-12 flex items-center justify-start gap-3 shadow-sm" variant="outline">
                <Link to="/authority/incidents">
                  <ClipboardList className="h-5 w-5 text-primary shrink-0" />
                  <div className="text-left">
                    <div className="font-bold text-xs">Open Workspace</div>
                    <div className="text-[10px] text-muted-foreground">Manage Incidents</div>
                  </div>
                </Link>
              </Button>
              <Button asChild className="rounded-xl h-12 flex items-center justify-start gap-3 shadow-sm" variant="outline">
                <Link to="/authority/people">
                  <FileCheck className="h-5 w-5 text-warning shrink-0" />
                  <div className="text-left">
                    <div className="font-bold text-xs">Approve Requests</div>
                    <div className="text-[10px] text-muted-foreground">{pendingApprovalsCount} applications pending</div>
                  </div>
                </Link>
              </Button>
              <Button asChild className="rounded-xl h-12 flex items-center justify-start gap-3 shadow-sm" variant="outline">
                <Link to="/authority/resources">
                  <PlusCircle className="h-5 w-5 text-success shrink-0" />
                  <div className="text-left">
                    <div className="font-bold text-xs">Add Resource</div>
                    <div className="text-[10px] text-muted-foreground">Register equipment</div>
                  </div>
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Incident Trends Chart */}
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-5">
              <SectionTitle
                title="Response & Resolution Trends"
                action={
                  <Button size="sm" variant="ghost" className="text-xs">
                    Monthly Overview <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                }
              />
              <div className="h-72 mt-2">
                <ResponsiveContainer>
                  <AreaChart data={chartMockData}>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="month" fontSize={11} stroke="currentColor" opacity={0.5} />
                    <YAxis fontSize={11} stroke="currentColor" opacity={0.5} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid var(--color-border)",
                        background: "var(--color-card)",
                      }}
                    />
                    <Area
                      type="monotone"
                      name="Reported Incidents"
                      dataKey="reported"
                      stroke="var(--color-primary)"
                      fill="url(#g1)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      name="Resolved Incidents"
                      dataKey="resolved"
                      stroke="var(--color-success)"
                      fill="url(#g2)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Recent Activity Feed */}
        <Card className="border-border/60 shadow-sm flex flex-col h-full">
          <CardHeader className="p-5 border-b shrink-0">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <History className="h-4 w-4 text-primary" /> Recent Operations Feed
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 flex-1 overflow-y-auto">
            {loading ? (
              <div className="text-center py-6 text-xs text-muted-foreground">Syncing feed events...</div>
            ) : (
              <div className="relative border-l border-muted-foreground/20 pl-4 ml-2 space-y-4 py-1 text-xs">
                {finalFeed.map((item) => (
                  <div key={item.id} className="relative">
                    <div
                      className={cn(
                        "absolute -left-[21px] top-1.5 h-2 w-2 rounded-full border border-background",
                        item.action.includes("Resolved")
                          ? "bg-success"
                          : item.action.includes("Verified")
                            ? "bg-warning"
                            : item.action.includes("Assigned")
                              ? "bg-primary"
                              : "bg-info",
                      )}
                    />
                    <div>
                      <div className="font-semibold text-foreground">
                        {item.action}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                        {item.type === "incident" ? (
                          <span>
                            {item.incidentNumber} - {item.incidentTitle}
                          </span>
                        ) : (
                          <span>
                            {item.resourceId} - {item.resourceName}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-1">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span>
                          {item.timestamp.toLocaleTimeString("en-IN", {
                            hour: "numeric",
                            minute: "numeric",
                          })}
                        </span>
                        <span>·</span>
                        <span className="capitalize">{item.performedBy} ({item.performedByRole})</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
