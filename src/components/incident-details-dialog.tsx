import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Calendar, User, Phone, MapPin, ShieldAlert, CheckCircle2, Clock, Eye, AlertTriangle } from "lucide-react";
import { getStatusBadgeTone, INCIDENT_STATUS, VALID_TRANSITIONS } from "@/lib/constants/incident-status";
import { incidentService } from "@/services/incidentService";
import { API_URL } from "@/lib/config";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface IncidentDetailsDialogProps {
  incident: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

export function IncidentDetailsDialog({ incident, open, onOpenChange, onUpdate }: IncidentDetailsDialogProps) {
  const { user } = useAuth();
  const [activeIncident, setActiveIncident] = useState<any>(incident);
  const [rescueTeams, setRescueTeams] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [selectedRescueTeam, setSelectedRescueTeam] = useState<string>("");
  const [selectedVolunteers, setSelectedVolunteers] = useState<string[]>([]);
  const [resolutionNotes, setResolutionNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch updated incident and lists of available responders
  useEffect(() => {
    if (!incident || !open) return;
    setActiveIncident(incident);
    setSelectedRescueTeam(incident.assignedRescueTeam?._id || incident.assignedRescueTeam || "");
    setSelectedVolunteers(
      (incident.assignedVolunteers || []).map((v: any) => v._id || v)
    );
    setResolutionNotes(incident.resolutionNotes || "");

    const token = localStorage.getItem("resqnet.token");
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

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
  const allowedTransitions = VALID_TRANSITIONS[currentStatus as keyof typeof VALID_TRANSITIONS] || [];

  // Submit status update
  const handleStatusTransition = async (nextStatus: string) => {
    setIsSubmitting(true);
    try {
      const updated = await incidentService.updateIncidentStatus(
        activeIncident._id,
        nextStatus,
        nextStatus === INCIDENT_STATUS.RESOLVED ? resolutionNotes : undefined
      );
      setActiveIncident(updated);
      toast.success(`Status updated to ${nextStatus}`);
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
      if (onUpdate) onUpdate();
    } catch (err: any) {
      toast.error(err.message || "Failed to update assignments");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVolunteerToggle = (volId: string) => {
    setSelectedVolunteers((prev) =>
      prev.includes(volId) ? prev.filter((id) => id !== volId) : [...prev, volId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl glass-strong border shadow-elegant">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-emergency/15 text-emergency flex items-center justify-center font-bold text-lg">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                {activeIncident.incidentNumber || "Incident Details"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Category: <span className="font-semibold text-foreground">{activeIncident.category}</span>
                {" · "}
                Reported: {formatDate(activeIncident.createdAt)}
              </DialogDescription>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge className={cn("rounded-full px-2.5 py-0.5", getStatusBadgeTone(currentStatus))}>
              {currentStatus}
            </Badge>
            <Badge variant="outline" className="rounded-full px-2.5 py-0.5 uppercase tracking-wider text-[10px]">
              {activeIncident.severity} Severity
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4 text-sm">
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
                  <div className="font-medium">{activeIncident.address || "No address details"}</div>
                  <div className="text-xs text-muted-foreground font-mono mt-0.5">
                    {activeIncident.district}, {activeIncident.state}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                    ({activeIncident.coordinates.lat.toFixed(5)}° N, {activeIncident.coordinates.lng.toFixed(5)}° E)
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
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Rescue Team</div>
                {activeIncident.assignedRescueTeam ? (
                  <div className="mt-1">
                    <div className="font-medium">{activeIncident.assignedRescueTeam.name}</div>
                    <div className="text-xs text-muted-foreground">{activeIncident.assignedRescueTeam.organizationName}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3" /> {activeIncident.assignedRescueTeam.mobileNumber}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground mt-1 italic">No Rescue Team assigned yet</div>
                )}
              </div>

              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Volunteers</div>
                {activeIncident.assignedVolunteers && activeIncident.assignedVolunteers.length > 0 ? (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {activeIncident.assignedVolunteers.map((vol: any) => (
                      <Badge key={vol._id} variant="secondary" className="rounded-full text-xs">
                        {vol.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground mt-1 italic">No volunteers assigned</div>
                )}
              </div>
            </div>
          </div>

          {/* Resolution Notes (If Resolved) */}
          {currentStatus === INCIDENT_STATUS.RESOLVED && activeIncident.resolutionNotes && (
            <div className="bg-success/5 border border-success/20 p-4 rounded-xl">
              <div className="text-[10px] text-success uppercase font-semibold tracking-wider">Resolution Summary</div>
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
                  <Label htmlFor="rescue-select" className="text-xs text-muted-foreground">Select Response Unit</Label>
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
                    <Label className="text-xs text-muted-foreground">Select Auxiliary Volunteers</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1.5 max-h-40 overflow-y-auto border p-3 rounded-lg bg-background/50">
                      {volunteers.map((vol) => {
                        const checked = selectedVolunteers.includes(vol._id);
                        return (
                          <label
                            key={vol._id}
                            className={cn(
                              "flex items-center gap-2 p-1.5 rounded-lg border text-xs cursor-pointer hover:bg-accent/40 transition",
                              checked && "bg-primary/5 border-primary/30"
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
            {user && (user.role === "authority" || user.role === "admin") && currentStatus === INCIDENT_STATUS.REPORTED && (
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
                      <Label htmlFor="res-notes" className="text-xs text-muted-foreground font-semibold">Resolution Notes</Label>
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
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
