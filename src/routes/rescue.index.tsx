import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import {
    CheckCircle,
  Truck,
  Compass,
  ArrowRight,
  ClipboardList,
  Boxes,
  MapPin,
    } from "lucide-react";
import { useState, useEffect } from "react";
import { incidentService } from "@/services/incidentService";
import { resourceService } from "@/services/resourceService";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/rescue/")({
  head: () => ({ meta: [{ title: "Rescue Dashboard — ResQNet" }] }),
  component: RescueDashboard,
});

function RescueDashboard() {
  const [incidentsList, setIncidentsList] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRescueData = async () => {
      try {
        setLoading(true);
        const [myInc, allRes] = await Promise.all([
          incidentService.getMyIncidents(),
          resourceService.getResources(),
        ]);
        setIncidentsList(myInc);
        setResources(allRes);
      } catch (err) {
        console.error("Error loading rescue data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRescueData();
  }, []);

  const activeMissions = incidentsList.filter((i) => i.status !== "Resolved");
  const completedMissions = incidentsList.filter((i) => i.status === "Resolved");

  // Filter resources assigned to this rescue team's active incidents
  const activeIncidentIds = activeMissions.map((i) => i._id);
  const assignedResources = resources.filter((r) => {
    const incId = r.assignedIncident?._id || r.assignedIncident;
    return incId && activeIncidentIds.includes(incId);
  });

  return (
    <AppShell title="Rescue Squad Command Center">
      <p className="text-muted-foreground -mt-1 mb-6">
        Field operations oversight. Monitor assigned dispatches, audit deployed equipment, and finalize case reports.
      </p>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Active Missions"
          value={loading ? "..." : String(activeMissions.length)}
          sublabel="Under field response"
          icon={Compass}
          accent="primary"
          delay={0}
        />
        <StatCard
          label="Completed Missions"
          value={loading ? "..." : String(completedMissions.length)}
          sublabel="Successfully resolved"
          icon={CheckCircle}
          accent="success"
          delay={0.05}
        />
        <StatCard
          label="Assigned Equipment"
          value={loading ? "..." : String(assignedResources.length)}
          sublabel="Active stockpile dispatches"
          icon={Boxes}
          accent="info"
          delay={0.1}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6 mt-6">
        {/* Left column: Active Mission Stream */}
        <div className="space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="p-5 border-b">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-primary" /> Active Missions Workspace
                </span>
                <Button asChild size="sm" className="rounded-full shadow-sm text-xs">
                  <Link to="/rescue/missions">
                    Open Missions Board <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-hidden divide-y">
              {loading ? (
                <div className="p-6 text-center text-xs text-muted-foreground">Syncing missions...</div>
              ) : activeMissions.length === 0 ? (
                <div className="p-8 text-center text-xs italic text-muted-foreground">
                  No active missions assigned. Standby for command dispatches.
                </div>
              ) : (
                activeMissions.map((inc) => (
                  <div key={inc._id} className="p-4 hover:bg-accent/40 transition flex items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-muted-foreground text-[10px]">
                          {inc.incidentNumber}
                        </span>
                        <Badge variant="outline" className="text-[9px] uppercase font-semibold">
                          {inc.severity} Severity
                        </Badge>
                      </div>
                      <div className="font-bold text-foreground">{inc.title}</div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{inc.address || `${inc.district}, ${inc.state}`}</span>
                      </div>
                    </div>
                    <Button asChild size="sm" variant="ghost" className="rounded-full text-xs">
                      <Link to="/rescue/missions">
                        Open <ClipboardList className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Assigned Stockpile Resources */}
        <Card className="border-border/60 shadow-sm h-fit">
          <CardHeader className="p-5 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" /> Active Equipment Assets
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            {loading ? (
              <div className="text-center py-4 text-xs text-muted-foreground">Syncing assets...</div>
            ) : assignedResources.length === 0 ? (
              <div className="text-center py-6 text-xs italic text-muted-foreground">
                No active stockpile assets assigned to your current missions.
              </div>
            ) : (
              <div className="space-y-3.5">
                {assignedResources.map((res) => (
                  <div key={res._id} className="border p-3 rounded-xl bg-card hover:shadow-xs transition text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-primary">
                        {res.resourceId}
                      </span>
                      <Badge className={cn("text-[9px] px-1.5 py-0.5 rounded-full capitalize")}>
                        {res.status}
                      </Badge>
                    </div>
                    <div className="font-semibold text-foreground truncate">{res.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      Deployed on: {res.assignedIncident?.incidentNumber || "Active Incident"}
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
