import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { incidentService } from "@/services/incidentService";
import { resourceService } from "@/services/resourceService";
import { getStatusBadgeTone } from "@/lib/constants/incident-status";
import {
    MapPin,
  Calendar,
  Users,
  Truck,
  History,
  ShieldAlert,
  BookOpen,
  Mail,
  Phone,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/volunteer/missions")({
  head: () => ({ meta: [{ title: "My Missions — ResQNet" }] }),
  component: VolunteerMissionsPage,
});

const formatDate = (dateString: string | Date) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

function VolunteerMissionsPage() {
  const {} = useAuth();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [activeIncident, setActiveIncident] = useState<any>(null);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOpsData = async () => {
    setLoading(true);
    try {
      const myInc = await incidentService.getMyIncidents();
      setIncidents(myInc);

      // Select active incident
      if (activeIncident) {
        const refreshed = myInc.find((i) => i._id === activeIncident._id);
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
    (r) =>
      r.assignedIncident?._id === activeIncident?._id || r.assignedIncident === activeIncident?._id,
  );

  return (
    <AppShell title="Auxiliary Volunteer Missions Board">
      <p className="text-muted-foreground -mt-1 mb-6">
        Relief Operations Panel. Review case details, coordinate with squad leaders on the ground, and view safety instructions.
      </p>

      {loading && incidents.length === 0 ? (
        <div className="flex h-[400px] items-center justify-center">
          <div className="animate-pulse text-muted-foreground text-sm font-medium">
            Loading mission logs...
          </div>
        </div>
      ) : incidents.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="p-8 text-center flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-muted grid place-items-center mb-4 text-muted-foreground">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="font-semibold text-lg">No Mission Assignments</div>
            <p className="text-muted-foreground text-sm mt-1 max-w-sm">
              You are not currently assigned to any active emergency relief operations. Standby for command deployment alerts.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
          {/* LEFT: Incident List Sidebar */}
          <Card className="border-border/60 h-[70vh] flex flex-col overflow-hidden">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase">Assigned Missions</CardTitle>
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
                      isActive && "bg-primary/5 border-l-2 border-primary",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-muted-foreground">
                        {inc.incidentNumber}
                      </span>
                      <Badge
                        className={cn(
                          "text-[9px] px-1.5 py-0 rounded-full capitalize",
                          getStatusBadgeTone(inc.status),
                        )}
                      >
                        {inc.status}
                      </Badge>
                    </div>
                    <div className="font-bold text-foreground truncate">{inc.title}</div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {inc.address || `${inc.district}, ${inc.state}`}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* RIGHT: Active Incident Detail Panel */}
          {activeIncident && (
            <div className="space-y-6">
              {/* Mission Summary Card */}
              <Card className="border-border/60 shadow-elegant">
                <CardContent className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                    <div>
                      <span className="font-mono text-xs text-muted-foreground font-bold">
                        {activeIncident.incidentNumber}
                      </span>
                      <h2 className="text-lg font-bold">{activeIncident.title}</h2>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" /> Assigned:{" "}
                        {formatDate(activeIncident.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          getStatusBadgeTone(activeIncident.status),
                        )}
                      >
                        {activeIncident.status}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="rounded-full px-2.5 py-0.5 text-xs uppercase"
                      >
                        {activeIncident.severity} Severity
                      </Badge>
                    </div>
                  </div>

                  {/* Summary */}
                  <div>
                    <Label className="text-xs text-muted-foreground font-bold uppercase">
                      Emergency Case Details
                    </Label>
                    <p className="text-sm leading-relaxed bg-muted/20 border p-3.5 rounded-xl whitespace-pre-line text-foreground">
                      {activeIncident.description}
                    </p>
                  </div>

                  {/* AI Triage Diagnostics */}
                  {(activeIncident.aiSummary || activeIncident.aiDamageAssessment || activeIncident.aiPriority) && (
                    <div className="border border-primary/20 bg-primary/5 rounded-xl p-3.5 space-y-2.5 text-xs">
                      <div className="flex items-center gap-1.5 text-primary font-bold uppercase">
                        <Sparkles className="h-3.5 w-3.5" /> ResQNet AI Triage Diagnostics
                      </div>
                      {activeIncident.aiSummary && (
                        <div>
                          <span className="text-muted-foreground font-semibold">AI Incident Summary:</span>
                          <p className="text-foreground leading-relaxed mt-0.5">{activeIncident.aiSummary}</p>
                        </div>
                      )}
                      {activeIncident.aiDamageAssessment && (
                        <div>
                          <span className="text-muted-foreground font-semibold">Visual Damage Assessment:</span>
                          <p className="text-foreground leading-relaxed mt-0.5 italic">{activeIncident.aiDamageAssessment}</p>
                        </div>
                      )}
                      {activeIncident.aiPriority && (
                        <div>
                          <span className="text-muted-foreground font-semibold font-mono">AI Triage Priority: </span>
                          <span className="font-bold text-primary font-mono">{activeIncident.aiPriority}</span>
                        </div>
                      )}
                      {activeIncident.aiRecommendedResources && activeIncident.aiRecommendedResources.length > 0 && (
                        <div>
                          <span className="text-muted-foreground font-semibold">Recommended Stockpile Assets:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {activeIncident.aiRecommendedResources.map((r: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-[9px] py-0 px-1.5 rounded-full capitalize">
                                {r}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Location Info */}
                  <div className="border p-3 rounded-xl bg-card text-xs space-y-1">
                    <div className="text-muted-foreground font-bold uppercase mb-1">
                      Incident Location
                    </div>
                    <div className="font-medium flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{activeIncident.address || "No address logged"}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono pl-5">
                      District: {activeIncident.district} · State: {activeIncident.state}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personnel on Ground Panel */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-primary" /> Response Personnel
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-xs space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-muted-foreground font-bold uppercase mb-1.5">
                        Rescue Squad Leader
                      </div>
                      {activeIncident.assignedRescueTeam ? (
                        <div className="border p-3 rounded-lg bg-muted/20 space-y-1.5">
                          <div>
                            <div className="font-bold text-foreground">
                              {activeIncident.assignedRescueTeam.name}
                            </div>
                            <div className="text-muted-foreground text-[10px]">
                              {activeIncident.assignedRescueTeam.organizationName} · {activeIncident.assignedRescueTeam.designation}
                            </div>
                          </div>
                          <div className="text-[10px] text-muted-foreground flex flex-col gap-0.5 pt-1.5 border-t">
                            <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {activeIncident.assignedRescueTeam.email}</span>
                            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {activeIncident.assignedRescueTeam.mobileNumber}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="italic text-muted-foreground bg-muted/10 p-2.5 rounded-lg border text-center">
                          No rescue team assigned.
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-muted-foreground font-bold uppercase mb-1.5">
                        Assigned Volunteers
                      </div>
                      {activeIncident.assignedVolunteers &&
                      activeIncident.assignedVolunteers.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {activeIncident.assignedVolunteers.map((vol: any) => (
                            <Badge key={vol._id} variant="secondary" className="rounded-full text-[10px]">
                              {vol.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <div className="italic text-muted-foreground bg-muted/10 p-2.5 rounded-lg border text-center">
                          No other volunteers assigned.
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Deployed Equipment Assets (Read-Only) */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-primary" /> Deployed Equipment Assets ({activeResources.length})
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
                        <div
                          key={res._id}
                          className="border p-3 rounded-xl bg-card flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-primary">
                                {res.resourceId}
                              </span>
                              <span className="font-semibold text-xs">{res.name}</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              Type: {res.type}
                            </div>
                          </div>
                          <div>
                            <Badge variant="outline" className="rounded-full px-2 py-0.5 text-[9px] uppercase font-bold">
                              {res.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Instructions Panel */}
              <Card className="border-border/60 shadow-sm border-l-4 border-l-primary">
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-primary" /> Operational Safety & Check-in Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-xs space-y-2 text-muted-foreground leading-relaxed">
                  <p className="font-semibold text-foreground">Please follow these safety guidelines when responding to this mission:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>**Check-in with Squad Leader**: Locate and report to the assigned Rescue Squad Leader on-site immediately upon arrival.</li>
                    <li>**Report Status**: Use check-in logs or contact channels. Do not enter disaster zones without direct approval.</li>
                    <li>**Supplies & Gear**: Cooperate in the organized distribution of relief kits, generators, or water supply packs.</li>
                    <li>**Emergency Evacuation**: In case of sudden structural failure or rising hazards, abort activities and proceed to nearest designated shelter.</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Mission Timeline Log */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    <History className="h-4 w-4 text-primary" /> Mission Activity Log
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {!activeIncident.activityLog || activeIncident.activityLog.length === 0 ? (
                    <div className="text-xs italic text-muted-foreground text-center py-4">
                      No events logged.
                    </div>
                  ) : (
                    <div className="relative border-l border-muted-foreground/20 pl-4 ml-2.5 space-y-4 py-1 text-xs">
                      {activeIncident.activityLog.map((log: any, idx: number) => (
                        <div key={idx} className="relative">
                          <div
                            className={cn(
                              "absolute -left-[22px] top-1 h-2.5 w-2.5 rounded-full border border-background",
                              log.action.includes("Resolved")
                                ? "bg-success"
                                : log.action.includes("Assigned")
                                  ? "bg-primary"
                                  : "bg-info",
                            )}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground">{log.action}</span>
                              <span className="text-[10px] text-muted-foreground">
                                {formatDate(log.timestamp)}
                              </span>
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              By: <span className="font-medium text-foreground">{log.performedBy?.name || "System"}</span> (Role: <span className="capitalize">{log.performedByRole}</span>)
                            </div>
                            {log.notes && (
                              <p className="mt-1 text-muted-foreground italic bg-muted/20 border p-2 rounded-lg leading-relaxed">
                                {log.notes}
                              </p>
                            )}
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
