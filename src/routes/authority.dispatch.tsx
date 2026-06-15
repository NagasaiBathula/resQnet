import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Clock,
  Play,
  X,
  User,
  History,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const formatDate = (dateString: string | Date) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export const Route = createFileRoute("/authority/dispatch")({
  head: () => ({ meta: [{ title: "Command Dispatch Console — ResQNet" }] }),
  component: AuthorityDispatchConsolePage,
});

function AuthorityDispatchConsolePage() {
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

  // Selection states
  const [selectedRescueTeam, setSelectedRescueTeam] = useState("");
  const [selectedVolunteers, setSelectedVolunteers] = useState<string[]>([]);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [resolutionNotes, setResolutionNotes] = useState("");

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const incData = await incidentService.getIncidents();
      setIncidents(incData);

      // If an incident was selected, refresh its active details
      if (activeIncident) {
        const refreshed = incData.find((i) => i._id === activeIncident._id);
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
      console.error("Error loading command data:", err);
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
    setSelectedRescueTeam(inc.assignedRescueTeam?._id || inc.assignedRescueTeam || "");
    setSelectedVolunteers((inc.assignedVolunteers || []).map((v: any) => v._id || v));
    setResolutionNotes(inc.resolutionNotes || "");
    setSelectedResources([]);
  };

  // Workflow updates
  const handleVerify = async () => {
    if (!activeIncident) return;
    setSubmitting(true);
    try {
      const updated = await incidentService.updateIncidentStatus(
        activeIncident._id,
        INCIDENT_STATUS.VERIFIED,
      );
      toast.success("Incident verified and approved");
      selectIncident(updated);
      loadInitialData();
    } catch (err: any) {
      toast.error(err.message || "Failed to verify incident");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignResponders = async () => {
    if (!activeIncident) return;
    setSubmitting(true);
    try {
      const updated = await incidentService.assignIncident(activeIncident._id, {
        assignedRescueTeam: selectedRescueTeam || undefined,
        assignedVolunteers: selectedVolunteers,
      });
      toast.success("Response units assigned to emergency");
      selectIncident(updated);
      loadInitialData();
    } catch (err: any) {
      toast.error(err.message || "Failed to assign response team");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAllocateAssets = async () => {
    if (!activeIncident || selectedResources.length === 0) return;
    setSubmitting(true);
    try {
      const res = await dispatchService.allocateResources(activeIncident._id, selectedResources);
      toast.success("Equipment successfully dispatched to scene");
      selectIncident(res.incident);
      setSelectedResources([]);
      loadInitialData();
    } catch (err: any) {
      toast.error(err.message || "Failed to dispatch assets");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReleaseAsset = async (resId: string) => {
    if (!activeIncident) return;
    setSubmitting(true);
    try {
      const res = await dispatchService.releaseResources(activeIncident._id, [resId]);
      toast.success("Resource released and returned to stockpile");
      selectIncident(res.incident);
      loadInitialData();
    } catch (err: any) {
      toast.error(err.message || "Failed to release resource");
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
      toast.success("Emergency incident marked as resolved");
      selectIncident(updated);
      loadInitialData();
    } catch (err: any) {
      toast.error(err.message || "Failed to resolve incident");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleVolunteer = (volId: string) => {
    setSelectedVolunteers((prev) =>
      prev.includes(volId) ? prev.filter((id) => id !== volId) : [...prev, volId],
    );
  };

  const toggleResourceSelection = (resId: string) => {
    setSelectedResources((prev) =>
      prev.includes(resId) ? prev.filter((id) => id !== resId) : [...prev, resId],
    );
  };

  // Local filters
  const filteredIncidents = incidents.filter((i) => {
    const matchesSearch =
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.incidentNumber.toLowerCase().includes(search.toLowerCase()) ||
      (i.address && i.address.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "all" || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Resources currently assigned to active incident
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
    <AppShell title="Incident dispatch console">
      <p className="text-muted-foreground -mt-1 mb-6">
        Coordinated Emergency Operations Hub. Review reports, verify crisis status, deploy
        personnel, and allocate regional assets.
      </p>

      {loading ? (
        <div className="flex h-[400px] items-center justify-center">
          <div className="animate-pulse text-muted-foreground text-sm font-medium">
            Synchronizing Command Console stream...
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[330px_1fr] gap-6 items-start">
          {/* LEFT COLUMN: Incidents Queue */}
          <Card className="border-border/60 shadow-sm h-[75vh] flex flex-col overflow-hidden">
            <CardHeader className="p-4 border-b space-y-2 shrink-0">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>Incidents Stream</span>
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
                    placeholder="Search incidents..."
                    className="pl-8 h-8 text-xs bg-muted/40 border-0"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-8 rounded-md border bg-background px-2 text-xs focus:ring-1"
                >
                  <option value="all">All statuses</option>
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
                  No matching incidents.
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
                        <span className="font-mono font-semibold text-muted-foreground text-[10px]">
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

          {/* RIGHT COLUMN: Active Dispatch Command Center */}
          {activeIncident ? (
            <div className="space-y-6">
              {/* Card 1: Emergency summary */}
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
                        <Calendar className="h-3.5 w-3.5" /> Reported on{" "}
                        {formatDate(activeIncident.createdAt)} by{" "}
                        <span className="font-semibold">
                          {activeIncident.reportedBy?.name || "Citizen"}
                        </span>{" "}
                        ({activeIncident.reportedByRole})
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
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
                        className="rounded-full px-2.5 py-0.5 text-xs uppercase"
                      >
                        {activeIncident.severity} Severity
                      </Badge>
                    </div>
                  </div>

                  <div className="text-sm space-y-1">
                    <Label className="text-xs text-muted-foreground font-bold uppercase">
                      Incident description
                    </Label>
                    <p className="text-foreground leading-relaxed bg-muted/20 border p-3.5 rounded-xl whitespace-pre-line">
                      {activeIncident.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="border p-3 rounded-xl bg-card">
                      <div className="text-muted-foreground font-bold uppercase mb-1">
                        Landmark / Coordinates
                      </div>
                      <div className="font-medium text-foreground">
                        {activeIncident.address || "No address provided"}
                      </div>
                      <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
                        District: {activeIncident.district}, State: {activeIncident.state}
                      </div>
                      <div className="font-mono text-[10px] text-muted-foreground">
                        GPS: {activeIncident.coordinates.lat.toFixed(5)}° N,{" "}
                        {activeIncident.coordinates.lng.toFixed(5)}° E
                      </div>
                    </div>

                    <div className="border p-3 rounded-xl bg-card space-y-2">
                      <div className="text-muted-foreground font-bold uppercase">
                        Quick Action Workflow
                      </div>

                      {activeIncident.status === INCIDENT_STATUS.REPORTED && (
                        <Button
                          onClick={handleVerify}
                          disabled={submitting}
                          className="w-full rounded-full shadow-glow"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve & Verify Crisis
                        </Button>
                      )}

                      {activeIncident.status === INCIDENT_STATUS.IN_PROGRESS && (
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Resolution notes (required to close case)..."
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
                            <CheckCircle2 className="h-4 w-4 mr-1.5" /> Complete Dispatch & Close
                            Incident
                          </Button>
                        </div>
                      )}

                      {(activeIncident.status === INCIDENT_STATUS.RESOLVED ||
                        activeIncident.status === INCIDENT_STATUS.VERIFIED ||
                        activeIncident.status === INCIDENT_STATUS.ASSIGNED) && (
                        <div className="text-xs text-muted-foreground italic p-2 text-center bg-muted/40 rounded-lg">
                          {activeIncident.status === INCIDENT_STATUS.RESOLVED
                            ? "Incident closed. Action log preserved."
                            : "Responders are verifying field parameters."}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Personnel deployment panel */}
              {activeIncident.status !== INCIDENT_STATUS.RESOLVED && (
                <Card className="border-border/60 shadow-sm">
                  <CardHeader className="p-4 border-b">
                    <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-primary" /> Personnel Deployment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Rescue Team Selector */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="rescue-select"
                          className="text-xs font-semibold text-muted-foreground"
                        >
                          Assign Response Unit
                        </Label>
                        <select
                          id="rescue-select"
                          value={selectedRescueTeam}
                          onChange={(e) => setSelectedRescueTeam(e.target.value)}
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

                      {/* Volunteers selector */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground">
                          Assign auxiliary volunteers
                        </Label>
                        {volunteers.length === 0 ? (
                          <div className="text-xs italic text-muted-foreground p-3 border rounded-lg">
                            No volunteers found.
                          </div>
                        ) : (
                          <div className="max-h-28 overflow-y-auto border p-2 rounded-lg bg-background/50 grid grid-cols-1 gap-1">
                            {volunteers.map((vol) => {
                              const checked = selectedVolunteers.includes(vol._id);
                              return (
                                <label
                                  key={vol._id}
                                  className={cn(
                                    "flex items-center gap-2 p-1 rounded border text-[11px] cursor-pointer hover:bg-accent/40",
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
                                    {vol.name} ({vol.skills?.[0] || "Volunteer"})
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={handleAssignResponders}
                      disabled={submitting}
                      className="w-full rounded-full text-xs h-9"
                    >
                      Apply Personnel Deployments
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Card 3: Stockpile Dispatch Asset allocations */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-primary" /> Dispatched Stockpile Assets
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {/* Currently assigned live resources */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase">
                      Active Assignments (Live)
                    </Label>
                    {activeResources.length === 0 ? (
                      <div className="text-xs italic text-muted-foreground bg-muted/20 border p-4 rounded-xl text-center">
                        No equipment assets currently assigned to this incident scene.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {activeResources.map((res) => (
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
                                Type: {res.type} · Status:{" "}
                                <span className="font-medium text-foreground">{res.status}</span>
                              </div>
                            </div>

                            {user &&
                              (user.role === "authority" || user.role === "admin") &&
                              activeIncident.status !== INCIDENT_STATUS.RESOLVED && (
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
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Allocate resources form */}
                  {activeIncident.status !== INCIDENT_STATUS.RESOLVED &&
                    user &&
                    (user.role === "authority" || user.role === "admin") && (
                      <div className="border-t pt-4 space-y-3">
                        <Label className="text-xs font-bold text-muted-foreground uppercase">
                          Available stockpile (Local Jurisdiction)
                        </Label>
                        {availableResources.length === 0 ? (
                          <div className="text-xs italic text-muted-foreground bg-muted/10 p-3 border rounded-lg">
                            No available emergency assets found in stockpile for {user.district},{" "}
                            {user.state}.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="max-h-32 overflow-y-auto border p-2 rounded-lg bg-background/50 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {availableResources.map((res) => {
                                const checked = selectedResources.includes(res._id);
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
                                      onChange={() => toggleResourceSelection(res._id)}
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
                            <Button
                              onClick={handleAllocateAssets}
                              disabled={submitting || selectedResources.length === 0}
                              className="w-full text-xs h-9 rounded-full shadow-glow"
                            >
                              Dispatch Selected Equipment
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                  {/* Historical Snapshot */}
                  <div className="border-t pt-4 space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase">
                      Incident Resource snapshot (Historical Record)
                    </Label>
                    {!activeIncident.allocatedResources ||
                    activeIncident.allocatedResources.length === 0 ? (
                      <div className="text-xs italic text-muted-foreground">
                        No deployment snapshot records saved in MongoDB.
                      </div>
                    ) : (
                      <div className="border rounded-xl overflow-hidden text-[11px]">
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
                            {activeIncident.allocatedResources.map((snap: any, index: number) => (
                              <tr key={index}>
                                <td className="p-2 font-mono text-[10px] font-semibold text-primary">
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
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Card 4: Incident Timeline logs */}
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    <History className="h-4 w-4 text-primary" /> Crisis Dispatch Activity log
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
                              By:{" "}
                              <span className="font-medium text-foreground">
                                {log.performedBy?.name || "System"}
                              </span>{" "}
                              (Role: <span className="capitalize">{log.performedByRole}</span>)
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
          ) : (
            <Card className="border-border/60 h-[50vh] flex items-center justify-center shadow-elegant">
              <CardContent className="text-center p-6 flex flex-col items-center">
                <ShieldAlert className="h-10 w-10 text-muted-foreground animate-bounce mb-3" />
                <div className="font-bold text-base">No Active Incident Selected</div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Choose an incident ticket from the left sidebar stream to inspect resources,
                  assign rescue units, or modify states.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </AppShell>
  );
}
