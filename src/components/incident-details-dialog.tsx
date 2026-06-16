import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
    User,
  Phone,
  MapPin,
  ShieldAlert,
  CheckCircle2,
  Clock,
      Truck,
  History,
    Play,
} from "lucide-react";
import {
  getStatusBadgeTone,
  INCIDENT_STATUS,
  VALID_TRANSITIONS,
} from "@/lib/constants/incident-status";
import { incidentService } from "@/services/incidentService";
import { resourceService } from "@/services/resourceService";
import { dispatchService } from "@/services/dispatchService";
import { API_URL } from "@/lib/config";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface IncidentDetailsDialogProps {
  incident: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

export function IncidentDetailsDialog({
  incident,
  open,
  onOpenChange,
  onUpdate,
}: IncidentDetailsDialogProps) {
  const { user } = useAuth();
  const [activeIncident, setActiveIncident] = useState<any>(incident);
  const [rescueTeams, setRescueTeams] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);

  const [selectedRescueTeam, setSelectedRescueTeam] = useState<string>("");
  const [selectedVolunteers, setSelectedVolunteers] = useState<string[]>([]);
  const [selectedAllocateResources, setSelectedAllocateResources] = useState<string[]>([]);
  const [resolutionNotes, setResolutionNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch updated incident and lists of available responders
  const loadRespondersAndResources = () => {
    if (!incident || !open) return;

    const token = localStorage.getItem("resqnet.token");
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    // Reload incident to get latest activityLog and allocatedResources
    incidentService
      .getIncidentById(incident._id || incident.incidentNumber)
      .then((data) => {
        setActiveIncident(data);
        setSelectedRescueTeam(data.assignedRescueTeam?._id || data.assignedRescueTeam || "");
        setSelectedVolunteers((data.assignedVolunteers || []).map((v: any) => v._id || v));
        setResolutionNotes(data.resolutionNotes || "");
      })
      .catch((err) => console.error("Error refreshing incident:", err));

    if (user && (user.role === "authority" || user.role === "admin")) {
      // Fetch rescue responders
      fetch(`${API_URL}/api/users?role=rescue`, { headers })
        .then((res) => res.json())
        .then((data) => setRescueTeams(Array.isArray(data) ? data : []))
        .catch((err) => console.error("Error fetching rescue teams:", err));

      // Fetch volunteers
      fetch(`${API_URL}/api/users?role=volunteer`, { headers })
        .then((res) => res.json())
        .then((data) => setVolunteers(Array.isArray(data) ? data : []))
        .catch((err) => console.error("Error fetching volunteers:", err));
    }

    // Fetch all resources (for allocation and monitoring)
    resourceService
      .getResources()
      .then((data) => setResources(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching resources:", err));
  };

  useEffect(() => {
    loadRespondersAndResources();
  }, [incident, open, user]);

  if (!activeIncident) return null;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const currentStatus = activeIncident.status;
  const isRescueAssigned =
    user?.role === "rescue" &&
    activeIncident.assignedRescueTeam?._id?.toString() === user?.id?.toString();

  // Allowed transitions
  const allowedTransitions =
    VALID_TRANSITIONS[currentStatus as keyof typeof VALID_TRANSITIONS] || [];

  // Submit status update
  const handleStatusTransition = async (nextStatus: string) => {
    setIsSubmitting(true);
    try {
      const updated = await incidentService.updateIncidentStatus(
        activeIncident._id,
        nextStatus,
        nextStatus === INCIDENT_STATUS.RESOLVED ? resolutionNotes : undefined,
      );
      setActiveIncident(updated);
      toast.success(`Status updated to ${nextStatus}`);
      loadRespondersAndResources();
      if (onUpdate) onUpdate();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit assignments
  const handleAssignSubmit = async () => {
    setIsSubmitting(true);
    try {
      const updated = await incidentService.assignIncident(activeIncident._id, {
        assignedRescueTeam: selectedRescueTeam || undefined,
        assignedVolunteers: selectedVolunteers,
      });
      setActiveIncident(updated);
      toast.success("Assignments updated successfully");
      loadRespondersAndResources();
      if (onUpdate) onUpdate();
    } catch (err: any) {
      toast.error(err.message || "Failed to update assignments");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVolunteerToggle = (volId: string) => {
    setSelectedVolunteers((prev) =>
      prev.includes(volId) ? prev.filter((id) => id !== volId) : [...prev, volId],
    );
  };

  const handleAllocate = async () => {
    if (selectedAllocateResources.length === 0) return;
    setIsSubmitting(true);
    try {
      const result = await dispatchService.allocateResources(
        activeIncident._id,
        selectedAllocateResources,
      );
      setActiveIncident(result.incident);
      toast.success("Resources allocated successfully");
      setSelectedAllocateResources([]);
      loadRespondersAndResources();
      if (onUpdate) onUpdate();
    } catch (err: any) {
      toast.error(err.message || "Failed to allocate resources");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRelease = async (resId: string) => {
    setIsSubmitting(true);
    try {
      const result = await dispatchService.releaseResources(activeIncident._id, [resId]);
      setActiveIncident(result.incident);
      toast.success("Resource released successfully");
      loadRespondersAndResources();
      if (onUpdate) onUpdate();
    } catch (err: any) {
      toast.error(err.message || "Failed to release resource");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResourceStatusChange = async (resId: string, newStatus: string) => {
    try {
      await resourceService.updateResourceStatus(resId, newStatus);
      toast.success(`Asset status updated to ${newStatus}`);
      loadRespondersAndResources();
      if (onUpdate) onUpdate();
    } catch (err: any) {
      toast.error(err.message || "Failed to update asset status");
    }
  };

  // Filter local stockpiles
  const activeResources = resources.filter(
    (r) =>
      r.assignedIncident?._id === activeIncident._id || r.assignedIncident === activeIncident._id,
  );

  const availableResources = resources.filter(
    (r) =>
      r.status === "Available" &&
      (user?.role === "admin" ||
        (r.managedByState === user?.state && r.managedByDistrict === user?.district)),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl glass-strong border shadow-elegant p-0">
        <div className="p-6 border-b">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-emergency/15 text-emergency flex items-center justify-center font-bold text-lg">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold tracking-tight">
                    {activeIncident.incidentNumber || "Incident Details"}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Category:{" "}
                    <span className="font-semibold text-foreground">{activeIncident.category}</span>
                    {" · "}
                    Reported: {formatDate(activeIncident.createdAt)}
                  </DialogDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge
                  className={cn("rounded-full px-2.5 py-0.5", getStatusBadgeTone(currentStatus))}
                >
                  {currentStatus}
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded-full px-2.5 py-0.5 uppercase tracking-wider text-[10px]"
                >
                  {activeIncident.severity} Severity
                </Badge>
              </div>
            </div>
          </DialogHeader>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <div className="px-6 bg-muted/40 border-b">
            <TabsList className="bg-transparent h-12 p-0 gap-6 border-b-0">
              <TabsTrigger
                value="overview"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none h-full px-1 text-sm font-medium"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="resources"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none h-full px-1 text-sm font-medium flex items-center gap-1.5"
              >
                <Truck className="h-4 w-4" /> Allocated Resources ({activeResources.length})
              </TabsTrigger>
              <TabsTrigger
                value="timeline"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none h-full px-1 text-sm font-medium flex items-center gap-1.5"
              >
                <History className="h-4 w-4" /> Activity Timeline (
                {activeIncident.activityLog?.length || 0})
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-6 mt-0">
              {/* Details & Description */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Incident Summary
                </h3>
                <Card className="border bg-card p-4 rounded-xl">
                  <div className="font-semibold text-base mb-1">{activeIncident.title}</div>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm">
                    {activeIncident.description}
                  </p>
                </Card>
              </div>

              {/* Location & Metadata */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Location & Reporter
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border bg-card p-4 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase">Address</div>
                      <div className="font-medium">
                        {activeIncident.address || "No address details"}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">
                        {activeIncident.district}, {activeIncident.state}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        ({activeIncident.coordinates.lat.toFixed(5)}° N,{" "}
                        {activeIncident.coordinates.lng.toFixed(5)}° E)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase">Reporter</div>
                      <div className="font-medium">
                        {activeIncident.reportedBy?.name || "Anonymous"}
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        Role: {activeIncident.reportedByRole}
                      </div>
                      {activeIncident.reportedBy?.mobileNumber && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3" /> {activeIncident.reportedBy.mobileNumber}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Team / Responder Assignments */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Assigned Personnel
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border bg-card p-4 rounded-xl">
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                      Rescue Team
                    </div>
                    {activeIncident.assignedRescueTeam ? (
                      <div className="mt-1">
                        <div className="font-medium">{activeIncident.assignedRescueTeam.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {activeIncident.assignedRescueTeam.organizationName}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3" />{" "}
                          {activeIncident.assignedRescueTeam.mobileNumber}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground mt-1 italic">
                        No Rescue Team assigned yet
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                      Volunteers
                    </div>
                    {activeIncident.assignedVolunteers &&
                    activeIncident.assignedVolunteers.length > 0 ? (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {activeIncident.assignedVolunteers.map((vol: any) => (
                          <Badge key={vol._id} variant="secondary" className="rounded-full text-xs">
                            {vol.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground mt-1 italic">
                        No volunteers assigned
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Resolution Notes (If Resolved) */}
              {currentStatus === INCIDENT_STATUS.RESOLVED && activeIncident.resolutionNotes && (
                <div className="bg-success/5 border border-success/20 p-4 rounded-xl">
                  <div className="text-[10px] text-success uppercase font-semibold tracking-wider">
                    Resolution Summary
                  </div>
                  <p className="text-sm font-medium text-foreground mt-1.5 whitespace-pre-line leading-relaxed">
                    {activeIncident.resolutionNotes}
                  </p>
                </div>
              )}

              {/* AUTHORITY ASSIGNMENTS FORM */}
              {user && (user.role === "authority" || user.role === "admin") && (
                <div className="border-t pt-4 space-y-4">
                  <h3 className="text-sm font-bold tracking-tight text-primary">
                    Command Assignment Panel
                  </h3>

                  <div className="space-y-3">
                    {/* Select Rescue Team */}
                    <div>
                      <Label htmlFor="rescue-select" className="text-xs text-muted-foreground">
                        Select Response Unit
                      </Label>
                      <select
                        id="rescue-select"
                        value={selectedRescueTeam}
                        onChange={(e) => setSelectedRescueTeam(e.target.value)}
                        className="w-full h-10 rounded-lg border bg-background px-3 py-1.5 text-sm mt-1 focus:ring-1"
                      >
                        <option value="">-- Choose Rescue Team Responder --</option>
                        {rescueTeams.map((team) => (
                          <option key={team._id} value={team._id}>
                            {team.name} ({team.organizationName} - {team.specialization})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Select Volunteers */}
                    {volunteers.length > 0 && (
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Select Auxiliary Volunteers
                        </Label>
                        <div className="grid grid-cols-2 gap-2 mt-1.5 max-h-40 overflow-y-auto border p-3 rounded-lg bg-background/50">
                          {volunteers.map((vol) => {
                            const checked = selectedVolunteers.includes(vol._id);
                            return (
                              <label
                                key={vol._id}
                                className={cn(
                                  "flex items-center gap-2 p-1.5 rounded-lg border text-xs cursor-pointer hover:bg-accent/40 transition",
                                  checked && "bg-primary/5 border-primary/30",
                                )}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => handleVolunteerToggle(vol._id)}
                                  className="rounded border-gray-300 text-primary focus:ring-primary h-3.5 w-3.5"
                                />
                                <span className="truncate font-medium">{vol.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handleAssignSubmit}
                      disabled={isSubmitting}
                      className="w-full rounded-full shadow-glow"
                    >
                      Apply Assignments
                    </Button>
                  </div>
                </div>
              )}

              {/* Workflow Status Actions */}
              <div className="border-t pt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Workflow Status Actions
                </h3>

                {/* Authority: Verify Ticket */}
                {user &&
                  (user.role === "authority" || user.role === "admin") &&
                  currentStatus === INCIDENT_STATUS.REPORTED && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleStatusTransition(INCIDENT_STATUS.VERIFIED)}
                        disabled={isSubmitting}
                        className="flex-1 rounded-full shadow-glow"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1.5" /> Verify & Approve Incident
                      </Button>
                      <Button
                        onClick={() => handleStatusTransition(INCIDENT_STATUS.RESOLVED)}
                        disabled={isSubmitting}
                        variant="outline"
                        className="rounded-full text-emergency border-emergency/25 hover:bg-emergency/5"
                      >
                        Dismiss / Cancel
                      </Button>
                    </div>
                  )}

                {/* Rescue Team: Mark In Progress / Resolve */}
                {isRescueAssigned && (
                  <div className="space-y-4">
                    {currentStatus === INCIDENT_STATUS.ASSIGNED && (
                      <Button
                        onClick={() => handleStatusTransition(INCIDENT_STATUS.IN_PROGRESS)}
                        disabled={isSubmitting}
                        className="w-full rounded-full shadow-glow"
                      >
                        <Clock className="h-4 w-4 mr-1.5" /> Mark In Progress / En-Route
                      </Button>
                    )}

                    {currentStatus === INCIDENT_STATUS.IN_PROGRESS && (
                      <div className="space-y-3">
                        <div>
                          <Label
                            htmlFor="res-notes"
                            className="text-xs text-muted-foreground font-semibold"
                          >
                            Resolution Notes
                          </Label>
                          <Textarea
                            id="res-notes"
                            placeholder="Provide details on action taken, citizens evacuated, or supplies delivered..."
                            value={resolutionNotes}
                            onChange={(e) => setResolutionNotes(e.target.value)}
                            className="mt-1"
                            rows={4}
                          />
                        </div>
                        <Button
                          onClick={() => handleStatusTransition(INCIDENT_STATUS.RESOLVED)}
                          disabled={isSubmitting || !resolutionNotes.trim()}
                          className="w-full rounded-full bg-success hover:bg-success/90 text-white shadow-glow"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1.5" /> Mark Incident Resolved
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* General Status Transitions for Admin / General Overrides */}
                {user && user.role === "admin" && allowedTransitions.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    {allowedTransitions.map((nextStatus) => (
                      <Button
                        key={nextStatus}
                        onClick={() => handleStatusTransition(nextStatus)}
                        disabled={isSubmitting}
                        size="sm"
                        variant="outline"
                        className="rounded-full capitalize"
                      >
                        Advance to: {nextStatus}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* RESOURCES TAB */}
            <TabsContent value="resources" className="space-y-6 mt-0">
              {/* Live Assigned Resources */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center justify-between">
                  <span>Currently Assigned Stockpile Assets (Live)</span>
                  <span className="text-muted-foreground text-[10px] normal-case">
                    Operational updates and release controls
                  </span>
                </h3>
                {activeResources.length === 0 ? (
                  <div className="text-sm italic text-muted-foreground bg-muted/30 border p-6 rounded-xl text-center">
                    No resources currently allocated to this mission.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeResources.map((res) => {
                      const isAssignedRescue =
                        user?.role === "rescue" &&
                        activeIncident.assignedRescueTeam?._id?.toString() === user?.id?.toString();
                      return (
                        <Card
                          key={res._id}
                          className="border bg-card p-3 rounded-xl hover:shadow-sm transition"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-primary font-semibold">
                                  {res.resourceId}
                                </span>
                                <span className="font-semibold text-sm">{res.name}</span>
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1.5 py-0.5 rounded"
                                >
                                  {res.type}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-4">
                                <span>
                                  State/Dist: {res.district}, {res.state}
                                </span>
                                <span>Assignments: {res.totalAssignments}</span>
                                <span>Util: {res.totalUsageHours} hrs</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center">
                              {/* Status Badge */}
                              <Badge
                                className={cn(
                                  "rounded-full px-2 py-0.5 text-xs font-medium",
                                  res.status === "In Use"
                                    ? "bg-emergency/15 text-emergency border border-emergency/25"
                                    : res.status === "Assigned"
                                      ? "bg-info/15 text-info border border-info/25"
                                      : "bg-muted text-muted-foreground",
                                )}
                              >
                                {res.status}
                              </Badge>

                              {/* Action Toggles for Rescuers */}
                              {isAssignedRescue && (
                                <div className="flex gap-1">
                                  {res.status === "Assigned" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleResourceStatusChange(res._id, "In Use")}
                                      className="h-7 text-xs px-2"
                                    >
                                      <Play className="h-3 w-3 mr-1" /> Mark In Use
                                    </Button>
                                  )}
                                  {res.status === "In Use" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleResourceStatusChange(res._id, "Available")
                                      }
                                      className="h-7 text-xs px-2 text-success hover:bg-success/5 border-success/20"
                                    >
                                      <CheckCircle2 className="h-3 w-3 mr-1" /> Mission Done
                                    </Button>
                                  )}
                                </div>
                              )}

                              {/* Manual Release for Authorities/Admins */}
                              {user && (user.role === "authority" || user.role === "admin") && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRelease(res._id)}
                                  className="h-7 text-xs px-2 border-emergency/20 text-emergency hover:bg-emergency/5"
                                >
                                  Release Asset
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Allocation Control Panel for Authorities/Admins */}
              {user && (user.role === "authority" || user.role === "admin") && (
                <div className="border-t pt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Allocate Stockpile Assets (Available Local Stock)
                  </h3>
                  {availableResources.length === 0 ? (
                    <div className="text-xs italic text-muted-foreground bg-muted/10 border p-4 rounded-xl">
                      No available assets found in your command jurisdiction ({user.district},{" "}
                      {user.state}). Register assets first.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="max-h-40 overflow-y-auto border p-3 rounded-lg bg-background/50 grid grid-cols-1 gap-2">
                        {availableResources.map((res) => {
                          const checked = selectedAllocateResources.includes(res._id);
                          return (
                            <label
                              key={res._id}
                              className={cn(
                                "flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer hover:bg-accent/40 transition",
                                checked && "bg-primary/5 border-primary/30",
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => {
                                    setSelectedAllocateResources((prev) =>
                                      prev.includes(res._id)
                                        ? prev.filter((id) => id !== res._id)
                                        : [...prev, res._id],
                                    );
                                  }}
                                  className="rounded border-gray-300 text-primary focus:ring-primary h-3.5 w-3.5"
                                />
                                <span className="font-mono font-semibold text-primary">
                                  {res.resourceId}
                                </span>
                                <span className="font-medium">{res.name}</span>
                                <Badge variant="outline" className="text-[9px] px-1 py-0.5">
                                  {res.type}
                                </Badge>
                              </div>
                              <span className="text-muted-foreground text-[10px]">
                                {res.district}, {res.state}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                      <Button
                        onClick={handleAllocate}
                        disabled={isSubmitting || selectedAllocateResources.length === 0}
                        className="w-full rounded-full shadow-glow"
                      >
                        Allocate Selected Assets
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Historical Incident Resource Snapshot */}
              <div className="border-t pt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5 text-muted-foreground" /> Incident Resource
                  Snapshot (Historical Record)
                </h3>
                {!activeIncident.allocatedResources ||
                activeIncident.allocatedResources.length === 0 ? (
                  <div className="text-xs italic text-muted-foreground">
                    No historical resources recorded.
                  </div>
                ) : (
                  <div className="border rounded-xl overflow-hidden bg-background/40">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted text-muted-foreground font-semibold">
                        <tr>
                          <th className="p-2.5">Asset Code</th>
                          <th className="p-2.5">Name</th>
                          <th className="p-2.5">Type</th>
                          <th className="p-2.5 text-right">Assigned At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {activeIncident.allocatedResources.map((snap: any, index: number) => (
                          <tr key={index} className="hover:bg-muted/10">
                            <td className="p-2.5 font-mono text-[10px] font-semibold text-primary">
                              {snap.resourceNumber}
                            </td>
                            <td className="p-2.5 font-medium">{snap.name}</td>
                            <td className="p-2.5 text-muted-foreground">{snap.type}</td>
                            <td className="p-2.5 text-right text-muted-foreground">
                              {new Date(snap.assignedAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TIMELINE TAB */}
            <TabsContent value="timeline" className="space-y-4 mt-0">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Operational Dispatch & Activity History
              </h3>
              {!activeIncident.activityLog || activeIncident.activityLog.length === 0 ? (
                <div className="text-sm italic text-muted-foreground text-center py-6">
                  No log activity records found.
                </div>
              ) : (
                <div className="relative border-l border-muted-foreground/20 pl-5 ml-2.5 space-y-5 py-2">
                  {activeIncident.activityLog.map((log: any, index: number) => {
                    return (
                      <div key={index} className="relative">
                        {/* Dot indicator */}
                        <div
                          className={cn(
                            "absolute -left-[27px] top-1 h-3.5 w-3.5 rounded-full border-2 border-background grid place-items-center",
                            log.action.includes("Resolved")
                              ? "bg-success"
                              : log.action.includes("Assigned")
                                ? "bg-primary"
                                : log.action.includes("Reported")
                                  ? "bg-muted-foreground"
                                  : "bg-info",
                          )}
                        />

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-foreground">
                              {log.action}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {formatDate(log.timestamp)}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            Performed By:{" "}
                            <span className="font-medium text-foreground">
                              {log.performedBy?.name || "System"}
                            </span>{" "}
                            (Role: <span className="capitalize">{log.performedByRole}</span>)
                          </div>
                          {log.notes && (
                            <p className="text-xs mt-1 text-foreground font-medium bg-muted/30 border p-2 rounded-lg leading-relaxed whitespace-pre-line">
                              {log.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="p-6 border-t bg-muted/10">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
