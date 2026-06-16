import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import { incidentService } from "@/services/incidentService";
import { resourceService } from "@/services/resourceService";
import { getStatusBadgeTone, INCIDENT_STATUS } from "@/lib/constants/incident-status";
import {
      Calendar,
  Users,
  Truck,
  CheckCircle2,
  Clock,
  Play,
  History,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/rescue/missions")({
  head: () => ({ meta: [{ title: "My Field Missions — ResQNet" }] }),
  component: RescueMissionsPage,
});

const formatDate = (dateString: string | Date) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

function RescueMissionsPage() {
  const {} = useAuth();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [activeIncident, setActiveIncident] = useState<any>(null);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [resolutionNotes, setResolutionNotes] = useState("");

  const loadOpsData = async (refreshActiveId?: string) => {
    setLoading(true);
    try {
      const myInc = await incidentService.getMyIncidents();
      setIncidents(myInc);

      // Select active incident
      const currentActiveId = refreshActiveId || activeIncident?._id;
      if (currentActiveId) {
        const refreshed = myInc.find((i) => i._id === currentActiveId);
        if (refreshed) {
          setActiveIncident(refreshed);
          setResolutionNotes(refreshed.resolutionNotes || "");
        }
      } else if (myInc.length > 0) {
        setActiveIncident(myInc[0]);
        setResolutionNotes(myInc[0].resolutionNotes || "");
      }

      // Fetch resources
      const allRes = await resourceService.getResources();
      setResources(allRes);
    } catch (err) {
      console.error("Error loading rescue operations:", err);
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
    setResolutionNotes(inc.resolutionNotes || "");
  };

  const handleStatusTransition = async (nextStatus: string) => {
    if (!activeIncident) return;
    setSubmitting(true);
    try {
      const updated = await incidentService.updateIncidentStatus(
        activeIncident._id,
        nextStatus,
        nextStatus === INCIDENT_STATUS.RESOLVED ? resolutionNotes : undefined,
      );
      toast.success(`Mission status updated to ${nextStatus}`);
      await loadOpsData(updated._id);
    } catch (err: any) {
      toast.error(err.message || "Failed to update mission status");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResourceStatusChange = async (resId: string, newStatus: string) => {
    try {
      await resourceService.updateResourceStatus(resId, newStatus);
      toast.success(`Asset status updated to ${newStatus}`);
      await loadOpsData(activeIncident?._id);
    } catch (err: any) {
      toast.error(err.message || "Failed to update asset status");
    }
  };

  const activeResources = resources.filter(
    (r) =>
      r.assignedIncident?._id === activeIncident?._id || r.assignedIncident === activeIncident?._id,
  );

  return (
    <AppShell title="Field Missions Workspace">
      <p className="text-muted-foreground -mt-1 mb-6">
        Dedicated Workspace. Update your mission status, manage assigned stockpile assets, and file completion logs.
      </p>

      {loading && incidents.length === 0 ? (
        <div className="flex h-[400px] items-center justify-center">
          <div className="animate-pulse text-muted-foreground text-sm font-medium">
            Loading field dispatch queue...
          </div>
        </div>
      ) : incidents.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="p-8 text-center flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-muted grid place-items-center mb-4 text-muted-foreground">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="font-semibold text-lg">No Active Mission Assignments</div>
            <p className="text-muted-foreground text-sm mt-1 max-w-sm">
              Your squad is not currently assigned to any active incident dispatches. Standby for command instructions.
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
              {/* Mission Summary */}
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

                  <div>
                    <Label className="text-xs text-muted-foreground font-bold uppercase">
                      Emergency details
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Location Info */}
                    <div className="border p-3 rounded-xl bg-card">
                      <div className="text-muted-foreground font-bold uppercase mb-1">
                        Target Location
                      </div>
                      <div className="font-medium">{activeIncident.address || "No address details"}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                        {activeIncident.district}, {activeIncident.state}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        GPS: {activeIncident.coordinates?.lat?.toFixed(5)}° N,{" "}
                        {activeIncident.coordinates?.lng?.toFixed(5)}° E
                      </div>
                    </div>

                    {/* Mission Workflow Control */}
                    <div className="border p-3 rounded-xl bg-card space-y-2">
                      <div className="text-muted-foreground font-bold uppercase">
                        Mission Status Control
                      </div>
                      {activeIncident.status === INCIDENT_STATUS.ASSIGNED && (
                        <Button
                          onClick={() => handleStatusTransition(INCIDENT_STATUS.IN_PROGRESS)}
                          disabled={submitting}
                          className="w-full rounded-full shadow-glow"
                        >
                          <Clock className="h-4 w-4 mr-1.5" /> Mark In Progress / En-Route
                        </Button>
                      )}

                      {activeIncident.status === INCIDENT_STATUS.IN_PROGRESS && (
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Provide details on action taken, citizen count saved..."
                            value={resolutionNotes}
                            onChange={(e) => setResolutionNotes(e.target.value)}
                            rows={2}
                            className="text-xs"
                          />
                          <Button
                            onClick={() => handleStatusTransition(INCIDENT_STATUS.RESOLVED)}
                            disabled={submitting || !resolutionNotes.trim()}
                            className="w-full bg-success hover:bg-success/90 text-white rounded-full shadow-glow text-xs font-semibold"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1.5" /> Mark Resolved & Close Case
                          </Button>
                        </div>
                      )}

                      {activeIncident.status === INCIDENT_STATUS.RESOLVED && (
                        <div className="bg-success/5 border border-success/20 p-2.5 rounded-lg text-success text-center">
                          Mission is fully resolved. Case record finalized.
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Deployed Equipment Assets */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-primary" /> Deployed Stockpile Assets ({activeResources.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {activeResources.length === 0 ? (
                    <div className="text-xs italic text-muted-foreground text-center py-4 bg-muted/10 border rounded-xl">
                      No stockpile assets allocated to your squad.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeResources.map((res) => (
                        <div
                          key={res._id}
                          className="border p-3 rounded-xl bg-card flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-primary">
                                {res.resourceId}
                              </span>
                              <span className="font-semibold text-xs">{res.name}</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              Type: {res.type} · Status:{" "}
                              <span className="font-bold text-foreground">{res.status}</span>
                            </div>
                          </div>
                          <div>
                            {res.status === "Assigned" && activeIncident.status !== INCIDENT_STATUS.RESOLVED && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleResourceStatusChange(res._id, "In Use")}
                                className="h-7 text-xs px-2 rounded-full"
                              >
                                <Play className="h-3 w-3 mr-1" /> Use Asset
                              </Button>
                            )}
                            {res.status === "In Use" && activeIncident.status !== INCIDENT_STATUS.RESOLVED && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleResourceStatusChange(res._id, "Available")}
                                className="h-7 text-xs px-2 text-success hover:bg-success/5 border-success/20 rounded-full"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Release
                              </Button>
                            )}
                            {(res.status !== "Assigned" && res.status !== "In Use" || activeIncident.status === INCIDENT_STATUS.RESOLVED) && (
                              <Badge variant="outline" className="text-[9px] capitalize rounded-full">
                                {res.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Assigned Volunteers */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-primary" /> Auxiliary Volunteers
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {!activeIncident.assignedVolunteers ||
                  activeIncident.assignedVolunteers.length === 0 ? (
                    <div className="text-xs italic text-muted-foreground py-2 text-center bg-muted/10 border rounded-xl">
                      No auxiliary volunteers assigned to this mission.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {activeIncident.assignedVolunteers.map((vol: any) => (
                        <div key={vol._id} className="border p-2.5 rounded-xl bg-card flex flex-col justify-between gap-1.5">
                          <div>
                            <div className="font-bold text-foreground">{vol.name}</div>
                            <div className="text-[10px] text-muted-foreground truncate">{vol.skills?.join(", ") || "General Support"}</div>
                          </div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 border-t pt-1.5 mt-1">
                            <span>Phone: {vol.mobileNumber}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Case Operation Timeline Log */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    <History className="h-4 w-4 text-primary" /> Case Operation log
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
