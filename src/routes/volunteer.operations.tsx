import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { incidentService } from "@/services/incidentService";
import { resourceService } from "@/services/resourceService";
import { getStatusBadgeTone } from "@/lib/constants/incident-status";
import { AlertTriangle, MapPin, Calendar, Users, Truck, History, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/volunteer/operations")({
  head: () => ({ meta: [{ title: "My Volunteer Missions — ResQNet" }] }),
  component: VolunteerOperationsPage,
});

function VolunteerOperationsPage() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [activeIncident, setActiveIncident] = useState<any>(null);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOpsData = async () => {
    setLoading(true);
    try {
      const myInc = await incidentService.getMyIncidents();
      setIncidents(myInc);
      
      // Update selected incident details
      if (activeIncident) {
        const refreshed = myInc.find(i => i._id === activeIncident._id);
        if (refreshed) {
          setActiveIncident(refreshed);
        }
      } else if (myInc.length > 0) {
        setActiveIncident(myInc[0]);
      }

      // Fetch all resources to filter active ones
      const allRes = await resourceService.getResources();
      setResources(allRes);
    } catch (err) {
      console.error("Error loading volunteer operations:", err);
      toast.error("Failed to load operations data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpsData();
  }, []);

  const selectIncident = (inc: any) => {
    setActiveIncident(inc);
  };

  const activeResources = resources.filter(
    r => r.assignedIncident?._id === activeIncident?._id || r.assignedIncident === activeIncident?._id
  );

  return (
    <AppShell title="Auxiliary Volunteer Missions">
      <p className="text-muted-foreground -mt-1 mb-6">
        View details of your assigned crisis response operations, team members, and allocated equipment.
      </p>

      {loading ? (
        <div className="flex h-[400px] items-center justify-center">
          <div className="animate-pulse text-muted-foreground text-sm font-medium">Loading volunteer mission list...</div>
        </div>
      ) : incidents.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="p-8 text-center flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-muted grid place-items-center mb-4 text-muted-foreground">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="font-semibold text-lg">No Active Mission Assignments</div>
            <p className="text-muted-foreground text-sm mt-1 max-w-sm">
              You are not currently assigned to any active emergency relief operations.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
          {/* Incident List Sidebar */}
          <Card className="border-border/60 h-[70vh] flex flex-col overflow-hidden">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-sm font-bold">Assigned Active Missions</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto divide-y">
              {incidents.map((inc) => {
                const isActive = activeIncident?._id === inc._id;
                return (
                  <div
                    key={inc._id}
                    onClick={() => selectIncident(inc)}
                    className={cn(
                      "p-3.5 text-xs cursor-pointer hover:bg-accent/40 transition-colors space-y-1",
                      isActive && "bg-primary/5 border-l-2 border-primary"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-muted-foreground">{inc.incidentNumber}</span>
                      <Badge className={cn("text-[9px] px-1.5 py-0 rounded-full capitalize", getStatusBadgeTone(inc.status))}>
                        {inc.status}
                      </Badge>
                    </div>
                    <div className="font-bold text-foreground truncate">{inc.title}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{inc.address || `${inc.district}, ${inc.state}`}</div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Active Incident Detail Panel */}
          {activeIncident && (
            <div className="space-y-6">
              <Card className="border-border/60 shadow-elegant">
                <CardContent className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                    <div>
                      <span className="font-mono text-xs text-muted-foreground font-bold">{activeIncident.incidentNumber}</span>
                      <h2 className="text-lg font-bold">{activeIncident.title}</h2>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" /> Assigned: {new Date(activeIncident.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", getStatusBadgeTone(activeIncident.status))}>
                        {activeIncident.status}
                      </Badge>
                      <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs uppercase">
                        {activeIncident.severity} Severity
                      </Badge>
                    </div>
                  </div>

                  {/* Summary */}
                  <div>
                    <Label className="text-xs text-muted-foreground font-bold uppercase">Case Details</Label>
                    <p className="text-sm leading-relaxed bg-muted/20 border p-3.5 rounded-xl whitespace-pre-line text-muted-foreground">
                      {activeIncident.description}
                    </p>
                  </div>

                  {/* Target location */}
                  <div className="border p-3.5 rounded-xl bg-card text-xs space-y-1">
                    <div className="text-muted-foreground font-bold uppercase">Target Location</div>
                    <div className="font-medium flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {activeIncident.address || "No address"}</div>
                    <div className="text-[10px] text-muted-foreground font-mono pl-5">
                      {activeIncident.district}, {activeIncident.state}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personnel on Ground */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-primary" /> Active Personnel
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-xs space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-muted-foreground font-bold uppercase mb-1">Rescue Squad</div>
                      {activeIncident.assignedRescueTeam ? (
                        <div className="border p-3 rounded-lg bg-muted/30">
                          <div className="font-semibold text-foreground">{activeIncident.assignedRescueTeam.name}</div>
                          <div className="text-muted-foreground text-[10px] mt-0.5">{activeIncident.assignedRescueTeam.organizationName}</div>
                        </div>
                      ) : (
                        <div className="italic text-muted-foreground">No rescue team assigned.</div>
                      )}
                    </div>
                    <div>
                      <div className="text-muted-foreground font-bold uppercase mb-1">Team Volunteers</div>
                      {activeIncident.assignedVolunteers && activeIncident.assignedVolunteers.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {activeIncident.assignedVolunteers.map((vol: any) => (
                            <Badge key={vol._id} variant="secondary" className="rounded-full">
                              {vol.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <div className="italic text-muted-foreground">No other volunteers assigned.</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Deployed Equipment Assets (Read-Only) */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-primary" /> Deployed Stockpile Assets ({activeResources.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {activeResources.length === 0 ? (
                    <div className="text-xs italic text-muted-foreground text-center py-4 bg-muted/10 border rounded-xl">
                      No stockpile assets allocated to this mission.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeResources.map((res) => (
                        <div key={res._id} className="border p-3 rounded-xl bg-card flex items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-primary">{res.resourceId}</span>
                              <span className="font-semibold text-xs">{res.name}</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              Type: {res.type}
                            </div>
                          </div>
                          <div>
                            <Badge className="rounded-full px-2 py-0.5 text-[10px] uppercase font-bold">
                              {res.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Timeline activity log */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    <History className="h-4 w-4 text-primary" /> Mission Timeline Log
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {!activeIncident.activityLog || activeIncident.activityLog.length === 0 ? (
                    <div className="text-xs italic text-muted-foreground text-center py-4">No events logged.</div>
                  ) : (
                    <div className="relative border-l border-muted-foreground/20 pl-4 ml-2.5 space-y-4 py-1 text-xs">
                      {activeIncident.activityLog.map((log: any, idx: number) => (
                        <div key={idx} className="relative">
                          <div className={cn(
                            "absolute -left-[22px] top-1 h-2.5 w-2.5 rounded-full border border-background",
                            log.action.includes("Resolved") ? "bg-success" :
                            log.action.includes("Assigned") ? "bg-primary" :
                            "bg-info"
                          )} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground">{log.action}</span>
                              <span className="text-[10px] text-muted-foreground">{new Date(log.timestamp).toLocaleDateString()}</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              By: <span className="font-medium text-foreground">{log.performedBy?.name || "System"}</span> (Role: <span className="capitalize">{log.performedByRole}</span>)
                            </div>
                            {log.notes && <p className="mt-1 text-muted-foreground italic bg-muted/20 border p-2 rounded-lg leading-relaxed">{log.notes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
