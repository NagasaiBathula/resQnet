import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import { incidentService } from "@/services/incidentService";
import { resourceService } from "@/services/resourceService";
import { dispatchService } from "@/services/dispatchService";
import { API_URL } from "@/lib/config";
import { getStatusBadgeTone, INCIDENT_STATUS } from "@/lib/constants/incident-status";
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Truck,
  ShieldAlert,
  CheckCircle2,
    Play,
  X,
    History,
      UserCheck,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/authority/incidents")({
  head: () => ({ meta: [{ title: "Incident Workspace — ResQNet" }] }),
  component: AuthorityIncidentsPage,
});

const formatDate = (dateString: string | Date) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

function AuthorityIncidentsPage() {
  const { user } = useAuth();

  const [incidents, setIncidents] = useState<any[]>([]);
  const [activeIncident, setActiveIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Lists of available resources & personnel
  const [rescueTeams, setRescueTeams] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);

  // Search & Filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selection states for Unified Assign Modal
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignedRescueTeam, setAssignedRescueTeam] = useState("");
  const [assignedVolunteers, setAssignedVolunteers] = useState<string[]>([]);
  const [allocatedResources, setAllocatedResources] = useState<string[]>([]);
  const [resolutionNotes, setResolutionNotes] = useState("");

  const loadInitialData = async (refreshActiveId?: string) => {
    setLoading(true);
    try {
      const incData = await incidentService.getIncidents();
      setIncidents(incData);

      // Restore active selection or set default
      const currentActiveId = refreshActiveId || activeIncident?._id;
      if (currentActiveId) {
        const refreshed = incData.find((i) => i._id === currentActiveId);
        if (refreshed) {
          selectIncident(refreshed);
        }
      } else if (incData.length > 0) {
        selectIncident(incData[0]);
      }

      const token = localStorage.getItem("resqnet.token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      // Rescue list
      const resTeamRes = await fetch(`${API_URL}/api/users?role=rescue`, { headers });
      const rescueData = await resTeamRes.json();
      setRescueTeams(Array.isArray(rescueData) ? rescueData : []);

      // Volunteer list
      const volRes = await fetch(`${API_URL}/api/users?role=volunteer`, { headers });
      const volunteerData = await volRes.json();
      setVolunteers(Array.isArray(volunteerData) ? volunteerData : []);

      // Resources stockpile list
      const stockData = await resourceService.getResources();
      setResources(Array.isArray(stockData) ? stockData : []);
    } catch (err) {
      console.error("Error loading workspace data:", err);
      toast.error("Failed to sync Command Dispatch database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const selectIncident = (inc: any) => {
    setActiveIncident(inc);
    setResolutionNotes(inc.resolutionNotes || "");
    // Prep defaults for assignments
    setAssignedRescueTeam(inc.assignedRescueTeam?._id || inc.assignedRescueTeam || "");
    setAssignedVolunteers((inc.assignedVolunteers || []).map((v: any) => v._id || v));
    setAllocatedResources([]);
  };

  // Contextual status triggers
  const handleVerify = async () => {
    if (!activeIncident) return;
    setSubmitting(true);
    try {
      const updated = await incidentService.updateIncidentStatus(
        activeIncident._id,
        INCIDENT_STATUS.VERIFIED,
      );
      toast.success("Incident verified and approved");
      await loadInitialData(updated._id);
    } catch (err: any) {
      toast.error(err.message || "Failed to verify incident");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartOperation = async () => {
    if (!activeIncident) return;
    setSubmitting(true);
    try {
      const updated = await incidentService.updateIncidentStatus(
        activeIncident._id,
        INCIDENT_STATUS.IN_PROGRESS,
      );
      toast.success("Incident advanced to In Progress. Field team notified.");
      await loadInitialData(updated._id);
    } catch (err: any) {
      toast.error(err.message || "Failed to advance operation");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveIncident = async () => {
    if (!activeIncident || !resolutionNotes.trim()) {
      toast.error("Please provide resolution notes before closing");
      return;
    }
    setSubmitting(true);
    try {
      const updated = await incidentService.updateIncidentStatus(
        activeIncident._id,
        INCIDENT_STATUS.RESOLVED,
        resolutionNotes,
      );
      toast.success("Incident marked as resolved. Stockpiles auto-released.");
      await loadInitialData(updated._id);
    } catch (err: any) {
      toast.error(err.message || "Failed to resolve incident");
    } finally {
      setSubmitting(false);
    }
  };

  // Unified Assignment Action
  const handleAssignResponseSubmit = async () => {
    if (!activeIncident) return;
    setSubmitting(true);
    try {
      // 1. Assign personnel
      await incidentService.assignIncident(activeIncident._id, {
        assignedRescueTeam: assignedRescueTeam || undefined,
        assignedVolunteers,
      });

      // 2. Allocate resources
      if (allocatedResources.length > 0) {
        await dispatchService.allocateResources(activeIncident._id, allocatedResources);
      }

      toast.success("Unified response plan successfully deployed!");
      setIsAssignOpen(false);
      await loadInitialData(activeIncident._id);
    } catch (err: any) {
      toast.error(err.message || "Failed to deploy response plan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReleaseAsset = async (resId: string) => {
    if (!activeIncident) return;
    setSubmitting(true);
    try {
      await dispatchService.releaseResources(activeIncident._id, [resId]);
      toast.success("Resource released and returned to stockpile");
      await loadInitialData(activeIncident._id);
    } catch (err: any) {
      toast.error(err.message || "Failed to release resource");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleVolunteer = (volId: string) => {
    setAssignedVolunteers((prev) =>
      prev.includes(volId) ? prev.filter((id) => id !== volId) : [...prev, volId],
    );
  };

  const toggleResource = (resId: string) => {
    setAllocatedResources((prev) =>
      prev.includes(resId) ? prev.filter((id) => id !== resId) : [...prev, resId],
    );
  };

  // Filtering
  const filteredIncidents = incidents.filter((i) => {
    const matchesSearch =
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.incidentNumber.toLowerCase().includes(search.toLowerCase()) ||
      (i.address && i.address.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "all" || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Resources active on current incident
  const activeResources = resources.filter(
    (r) =>
      r.assignedIncident?._id === activeIncident?._id || r.assignedIncident === activeIncident?._id,
  );

  // Available local resources
  const availableResources = resources.filter(
    (r) =>
      r.status === "Available" &&
      (user?.role === "admin" ||
        (r.managedByState === user?.state && r.managedByDistrict === user?.district)),
  );

  return (
    <AppShell title="Incident Operations Workspace">
      <p className="text-muted-foreground -mt-1 mb-6">
        Unified Operational Center. Monitor emergency streams, coordinate squads, allocate equipment, and log actions.
      </p>

      {loading && incidents.length === 0 ? (
        <div className="flex h-[400px] items-center justify-center">
          <div className="animate-pulse text-muted-foreground text-sm font-medium">
            Syncing operational channels...
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[330px_1fr] gap-6 items-start">
          {/* LEFT: Incident Queue */}
          <Card className="border-border/60 shadow-sm h-[75vh] flex flex-col overflow-hidden">
            <CardHeader className="p-4 border-b space-y-2 shrink-0">
              <CardTitle className="text-xs font-bold flex items-center justify-between text-muted-foreground uppercase">
                <span>Emergency Incidents</span>
                <Badge variant="secondary" className="font-mono text-xs">
                  {filteredIncidents.length}
                </Badge>
              </CardTitle>
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search case ID, state, etc..."
                    className="pl-8 h-8 text-xs bg-muted/40 border-0"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-8 rounded-md border bg-background px-2 text-xs"
                >
                  <option value="all">All Statuses</option>
                  <option value="Reported">Reported</option>
                  <option value="Verified">Verified</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto flex-1 divide-y">
              {filteredIncidents.length === 0 ? (
                <div className="p-6 text-center text-xs italic text-muted-foreground">
                  No incidents match filters.
                </div>
              ) : (
                filteredIncidents.map((inc) => {
                  const isActive = activeIncident?._id === inc._id;
                  return (
                    <div
                      key={inc._id}
                      onClick={() => selectIncident(inc)}
                      className={cn(
                        "p-3.5 text-xs cursor-pointer hover:bg-accent/40 transition-colors space-y-1.5",
                        isActive && "bg-primary/5 border-l-2 border-primary",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-muted-foreground text-[10px]">
                          {inc.incidentNumber}
                        </span>
                        <Badge
                          className={cn(
                            "text-[9px] px-1.5 py-0 font-medium rounded-full",
                            getStatusBadgeTone(inc.status),
                          )}
                        >
                          {inc.status}
                        </Badge>
                      </div>
                      <div className="font-bold text-foreground truncate">{inc.title}</div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">
                          {inc.address || `${inc.district}, ${inc.state}`}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* RIGHT: Operational Details & Workplace */}
          {activeIncident ? (
            <div className="space-y-6">
              {/* Overview Panel */}
              <Card className="border-border/60 shadow-elegant">
                <CardContent className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-muted-foreground font-bold">
                          {activeIncident.incidentNumber}
                        </span>
                        <h2 className="text-lg font-bold">{activeIncident.title}</h2>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" /> Reported:{" "}
                        {formatDate(activeIncident.createdAt)} by{" "}
                        <span className="font-semibold text-foreground">
                          {activeIncident.reportedBy?.name || "Citizen"}
                        </span>{" "}
                        ({activeIncident.reportedByRole})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase",
                          getStatusBadgeTone(activeIncident.status),
                        )}
                      >
                        {activeIncident.status}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="rounded-full px-2.5 py-0.5 text-xs uppercase font-medium"
                      >
                        {activeIncident.severity} Severity
                      </Badge>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="text-sm space-y-1">
                    <Label className="text-xs text-muted-foreground font-bold uppercase">
                      Emergency Description
                    </Label>
                    <p className="text-foreground leading-relaxed bg-muted/20 border p-4 rounded-xl whitespace-pre-line">
                      {activeIncident.description}
                    </p>
                  </div>

                  {/* Location & GPS */}
                  <div className="border p-3.5 rounded-xl bg-card text-xs space-y-1">
                    <div className="text-muted-foreground font-bold uppercase">Incident Location</div>
                    <div className="font-medium text-foreground">
                      {activeIncident.address || "No address details logged"}
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                      District: {activeIncident.district} · State: {activeIncident.state}
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                      GPS coordinates: {activeIncident.coordinates?.lat?.toFixed(5)}° N,{" "}
                      {activeIncident.coordinates?.lng?.toFixed(5)}° E
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Diagnostics Panel */}
              {(activeIncident.aiSummary || activeIncident.aiCategorySuggested || activeIncident.aiPriority) && (
                <Card className="border-primary/20 bg-primary/5 shadow-elegant">
                  <CardHeader className="p-4 border-b border-primary/10">
                    <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-primary">
                      <Sparkles className="h-4.5 w-4.5 animate-pulse" /> ResQNet AI Triage Diagnostics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <span className="text-muted-foreground font-semibold">AI Suggested Category:</span>
                        <div className="font-bold text-foreground mt-0.5">{activeIncident.aiCategorySuggested || activeIncident.category}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-semibold">AI Suggested Severity:</span>
                        <div className="font-bold text-foreground mt-0.5">{activeIncident.aiSeveritySuggested || activeIncident.severity}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-semibold">AI Triage Priority:</span>
                        <div className="font-bold text-primary mt-0.5 text-sm">{activeIncident.aiPriority || "N/A"}</div>
                      </div>
                    </div>
                    {activeIncident.aiSummary && (
                      <div>
                        <span className="text-muted-foreground font-semibold">AI Incident Summary:</span>
                        <p className="text-foreground leading-relaxed mt-0.5 bg-card/60 p-2.5 rounded-xl border border-border/40">{activeIncident.aiSummary}</p>
                      </div>
                    )}
                    {activeIncident.aiDamageAssessment && (
                      <div>
                        <span className="text-muted-foreground font-semibold">Visual Damage Assessment:</span>
                        <p className="text-foreground leading-relaxed mt-0.5 bg-card/60 p-2.5 rounded-xl border border-border/40 italic">{activeIncident.aiDamageAssessment}</p>
                      </div>
                    )}
                    {activeIncident.aiRecommendedResources && activeIncident.aiRecommendedResources.length > 0 && (
                      <div>
                        <span className="text-muted-foreground font-semibold">Advisory Stockpile Resource Hints:</span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {activeIncident.aiRecommendedResources.map((r: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-[10px] py-0 px-2 rounded-full">
                              {r}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* People & Teams Panel */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" /> Deployed Responders
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border p-3 rounded-lg bg-muted/20">
                      <div className="text-xs text-muted-foreground font-bold uppercase mb-1">
                        Rescue Squad
                      </div>
                      {activeIncident.assignedRescueTeam ? (
                        <div className="text-xs">
                          <div className="font-semibold text-foreground">
                            {activeIncident.assignedRescueTeam.name}
                          </div>
                          <div className="text-muted-foreground text-[10px]">
                            {activeIncident.assignedRescueTeam.organizationName} · {activeIncident.assignedRescueTeam.designation}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs italic text-muted-foreground">
                          No rescue team assigned.
                        </div>
                      )}
                    </div>

                    <div className="border p-3 rounded-lg bg-muted/20">
                      <div className="text-xs text-muted-foreground font-bold uppercase mb-1">
                        Assigned Volunteers
                      </div>
                      {activeIncident.assignedVolunteers &&
                      activeIncident.assignedVolunteers.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {activeIncident.assignedVolunteers.map((vol: any) => (
                            <Badge key={vol._id} variant="secondary" className="rounded-full text-[10px]">
                              {vol.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs italic text-muted-foreground">
                          No volunteers assigned.
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resources Panel */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" /> Dispatched Equipment
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeResources.length === 0 ? (
                      <div className="sm:col-span-2 text-xs italic text-muted-foreground text-center py-4 bg-muted/10 border rounded-xl">
                        No equipment currently dispatched to this scene.
                      </div>
                    ) : (
                      activeResources.map((res) => (
                        <div
                          key={res._id}
                          className="border p-2.5 rounded-xl bg-card hover:shadow-xs transition flex items-center justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] font-bold text-primary">
                                {res.resourceId}
                              </span>
                              <span className="font-semibold text-xs text-foreground truncate max-w-[120px]">
                                {res.name}
                              </span>
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              Type: {res.type} · Status: <span className="font-bold">{res.status}</span>
                            </div>
                          </div>
                          {activeIncident.status !== INCIDENT_STATUS.RESOLVED && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 rounded-full text-emergency hover:bg-emergency/5 shrink-0"
                              onClick={() => handleReleaseAsset(res._id)}
                              title="Release asset"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Historical Snapshot */}
                  {activeIncident.allocatedResources && activeIncident.allocatedResources.length > 0 && (
                    <div className="border-t pt-4">
                      <Label className="text-xs font-bold text-muted-foreground uppercase block mb-2">
                        Historical Snapshot (MongoDB Record)
                      </Label>
                      <div className="border rounded-xl overflow-hidden text-[10px]">
                        <table className="w-full text-left">
                          <thead className="bg-muted text-muted-foreground font-semibold">
                            <tr>
                              <th className="p-2">Asset Code</th>
                              <th className="p-2">Name</th>
                              <th className="p-2">Type</th>
                              <th className="p-2 text-right">Dispatched At</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y bg-background">
                            {activeIncident.allocatedResources.map((snap: any, idx: number) => (
                              <tr key={idx}>
                                <td className="p-2 font-mono font-semibold text-primary">
                                  {snap.resourceNumber}
                                </td>
                                <td className="p-2 font-medium">{snap.name}</td>
                                <td className="p-2 text-muted-foreground">{snap.type}</td>
                                <td className="p-2 text-right text-muted-foreground">
                                  {new Date(snap.assignedAt).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Timeline Log Panel */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <History className="h-4 w-4 text-primary" /> Case History & Operations Log
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {!activeIncident.activityLog || activeIncident.activityLog.length === 0 ? (
                    <div className="text-xs italic text-muted-foreground text-center py-4">
                      No logs captured.
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

              {/* Status Action Buttons Section */}
              <Card className="border-border/60 shadow-sm bg-muted/10">
                <CardContent className="p-4 flex flex-col gap-3">
                  <Label className="text-xs text-muted-foreground font-bold uppercase">
                    Workflow Actions
                  </Label>

                  {activeIncident.status === INCIDENT_STATUS.REPORTED && (
                    <Button
                      onClick={handleVerify}
                      disabled={submitting}
                      className="w-full rounded-full shadow-glow"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve & Verify Crisis
                    </Button>
                  )}

                  {activeIncident.status === INCIDENT_STATUS.VERIFIED && (
                    <Button
                      onClick={() => {
                        // Reset assign selections
                        setAssignedRescueTeam(activeIncident.assignedRescueTeam?._id || activeIncident.assignedRescueTeam || "");
                        setAssignedVolunteers((activeIncident.assignedVolunteers || []).map((v: any) => v._id || v));
                        setAllocatedResources([]);
                        setIsAssignOpen(true);
                      }}
                      disabled={submitting}
                      className="w-full rounded-full shadow-glow"
                    >
                      <UserCheck className="h-4 w-4 mr-1.5" /> Designate Responders & Dispatch Plan
                    </Button>
                  )}

                  {activeIncident.status === INCIDENT_STATUS.ASSIGNED && (
                    <Button
                      onClick={handleStartOperation}
                      disabled={submitting}
                      className="w-full rounded-full shadow-glow"
                    >
                      <Play className="h-4 w-4 mr-1.5" /> Deploy Field Response Squad (Start Operation)
                    </Button>
                  )}

                  {activeIncident.status === INCIDENT_STATUS.IN_PROGRESS && (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Provide closing operation details..."
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        rows={2}
                        className="text-xs"
                      />
                      <Button
                        onClick={handleResolveIncident}
                        disabled={submitting || !resolutionNotes.trim()}
                        className="w-full bg-success hover:bg-success/90 text-white rounded-full shadow-glow text-xs"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1.5" /> Mark Incident as Resolved
                      </Button>
                    </div>
                  )}

                  {activeIncident.status === INCIDENT_STATUS.RESOLVED && (
                    <div className="text-xs text-success bg-success/10 border border-success/20 p-3 rounded-lg text-center font-medium">
                      Incident is fully resolved. Deployment operations closed.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-border/60 h-[50vh] flex items-center justify-center shadow-elegant">
              <CardContent className="text-center p-6 flex flex-col items-center">
                <ShieldAlert className="h-10 w-10 text-muted-foreground animate-bounce mb-3" />
                <div className="font-bold text-base">No Incident Selected</div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Choose a ticket from the left sidebar queue to begin command dispatch operations.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* UNIFIED ASSIGN RESPONSE DIALOG */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-1.5">
              <UserCheck className="h-5 w-5 text-primary" /> Setup Response Assignment Plan
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-3 text-xs">
            {/* 1. Rescue Team Selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Assign Rescue Squad (Single Unit)
              </Label>
              <select
                value={assignedRescueTeam}
                onChange={(e) => setAssignedRescueTeam(e.target.value)}
                className="w-full h-10 rounded-lg border bg-background px-3 py-1.5 text-xs focus:ring-1"
              >
                <option value="">-- No rescue team assigned --</option>
                {rescueTeams.map((team) => (
                  <option key={team._id} value={team._id}>
                    {team.name} ({team.organizationName} - {team.specialization})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Volunteers Selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Assign Auxiliary Volunteers
              </Label>
              {volunteers.length === 0 ? (
                <div className="text-xs italic text-muted-foreground p-3 border rounded-lg">
                  No active volunteers available.
                </div>
              ) : (
                <div className="max-h-32 overflow-y-auto border p-2 rounded-lg bg-background/50 grid grid-cols-1 gap-1">
                  {volunteers.map((vol) => {
                    const checked = assignedVolunteers.includes(vol._id);
                    return (
                      <label
                        key={vol._id}
                        className={cn(
                          "flex items-center gap-2 p-1.5 rounded border text-[11px] cursor-pointer hover:bg-accent/40",
                          checked && "bg-primary/5 border-primary/30",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleVolunteer(vol._id)}
                          className="h-3 w-3 rounded text-primary"
                        />
                        <span className="truncate">
                          {vol.name} ({vol.skills?.[0] || "Volunteer"} · {vol.district}, {vol.state})
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Resources Selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Allocate Stockpile Equipment (Local Jurisdiction)
              </Label>
              {availableResources.length === 0 ? (
                <div className="text-xs italic text-muted-foreground p-3 border rounded-lg bg-muted/20">
                  No available equipment assets in jurisdiction: {user?.district}, {user?.state}
                </div>
              ) : (
                <div className="max-h-36 overflow-y-auto border p-2 rounded-lg bg-background/50 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableResources.map((res) => {
                    const checked = allocatedResources.includes(res._id);
                    return (
                      <label
                        key={res._id}
                        className={cn(
                          "flex items-center gap-2 p-1.5 rounded-lg border text-[11px] cursor-pointer hover:bg-accent/40",
                          checked && "bg-primary/5 border-primary/30",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleResource(res._id)}
                          className="h-3.5 w-3.5 rounded text-primary"
                        />
                        <div className="min-w-0">
                          <span className="font-mono text-[9px] font-bold text-primary block">
                            {res.resourceId}
                          </span>
                          <span className="font-medium truncate block leading-tight">
                            {res.name}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 border-t pt-4">
              <Button variant="ghost" className="rounded-full" onClick={() => setIsAssignOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAssignResponseSubmit}
                disabled={submitting}
                className="rounded-full shadow-glow"
              >
                Deploy Plan & Dispatches
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
