import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  User,
  Phone,
  Mail,
  Shield,
  MapPin,
  Briefcase,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Star,
} from "lucide-react";
import { PillBadge } from "./feature-page";
import { type ReactNode } from "react";

export interface UserProfileDetailsProps {
  user: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actions?: ReactNode;
}

export function UserProfileDetails({ user, open, onOpenChange, actions }: UserProfileDetailsProps) {
  if (!user) return null;

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
      case "Active":
        return (
          <Badge className="bg-success/15 text-success border-success/30 gap-1 rounded-full">
            <CheckCircle2 className="h-3 w-3" /> Approved / Active
          </Badge>
        );
      case "pending":
      case "Inactive":
        return (
          <Badge className="bg-warning/15 text-warning border-warning/30 gap-1 rounded-full">
            <Clock className="h-3 w-3" /> Pending / Inactive
          </Badge>
        );
      case "rejected":
      case "Suspended":
        return (
          <Badge className="bg-emergency/15 text-emergency border-emergency/30 gap-1 rounded-full">
            <XCircle className="h-3 w-3" /> Rejected / Suspended
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="rounded-full">
            {status}
          </Badge>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl glass-strong border shadow-elegant">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full gradient-primary text-white flex items-center justify-center font-bold text-lg shadow-glow">
              {user.avatar ||
                user.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">{user.name}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <span className="capitalize font-semibold text-primary">{user.role} Workspace</span>
                <span>·</span>
                <span>
                  Registered:{" "}
                  {formatDate(user.createdAt || user.registrationDate || new Date().toISOString())}
                </span>
              </DialogDescription>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {getStatusBadge(user.role === "authority" ? user.authorityStatus : user.status)}
            <PillBadge
              tone={
                user.role === "admin"
                  ? "emergency"
                  : user.role === "authority"
                    ? "warning"
                    : user.role === "rescue"
                      ? "info"
                      : "muted"
              }
            >
              {user.role}
            </PillBadge>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Section 1: Contact & Address */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> Contact & Location Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border bg-card p-4 text-sm">
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] text-muted-foreground uppercase">Email Address</div>
                  <div className="font-medium truncate">{user.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">Mobile Number</div>
                  <div className="font-medium">{user.mobileNumber || "N/A"}</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">
                    Jurisdiction (State / District)
                  </div>
                  <div className="font-medium">
                    {user.district}, {user.state}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] text-muted-foreground uppercase">Full Address</div>
                  <div className="font-medium truncate">{user.address || "N/A"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Role Specific Details */}
          {user.role === "volunteer" && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <HeartHandshakeIcon className="h-3.5 w-3.5" /> Volunteer Credentials
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border bg-card p-4 text-sm">
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">Demographics</div>
                  <div className="font-medium">
                    {user.age ? `${user.age} Years Old` : "N/A"} · {user.gender || "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">
                    Availability Mode
                  </div>
                  <div className="font-medium">{user.availability || "N/A"}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-[10px] text-muted-foreground uppercase">
                    Specialized Aid Skills
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {user.skills && user.skills.length > 0 ? (
                      user.skills.map((s: string) => (
                        <Badge key={s} variant="secondary" className="rounded-full text-xs">
                          {s}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">No specific skills listed</span>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-[10px] text-muted-foreground uppercase">
                    Prior Experience
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed bg-muted/40 p-2.5 rounded-lg border">
                    {user.volunteerExperience || "No prior volunteer experience listed."}
                  </p>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">
                    Emergency Contact
                  </div>
                  <div className="font-medium">{user.emergencyContactName || "N/A"}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">
                    Emergency Contact Phone
                  </div>
                  <div className="font-medium">{user.emergencyContactNumber || "N/A"}</div>
                </div>
                <div className="md:col-span-2 grid grid-cols-2 gap-2 mt-2 pt-2 border-t text-xs">
                  <div>
                    <span className="text-muted-foreground">Service Area:</span>{" "}
                    <span className="font-semibold">
                      {user.serviceAreaDistrict || user.district},{" "}
                      {user.serviceAreaState || user.state}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground">Missions Completed:</span>{" "}
                    <span className="font-semibold text-success">
                      {user.completedMissionsCount ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {user.role === "rescue" && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5" /> Rescue Responder Credentials
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border bg-card p-4 text-sm">
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">
                    Organization / Department
                  </div>
                  <div className="font-medium">{user.organizationName || "N/A"}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">
                    Employee / Officer ID
                  </div>
                  <div className="font-medium">{user.employeeId || "N/A"}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">
                    Official Designation
                  </div>
                  <div className="font-medium">{user.designation || "N/A"}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">
                    Years of Service
                  </div>
                  <div className="font-medium">
                    {user.yearsOfExperience ? `${user.yearsOfExperience} Years` : "N/A"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">
                    Active Specialization
                  </div>
                  <div className="font-medium text-emergency">{user.specialization || "N/A"}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">
                    Emergency Contact
                  </div>
                  <div className="font-medium">
                    {user.emergencyContactName
                      ? `${user.emergencyContactName} (${user.emergencyContactNumber})`
                      : "N/A"}
                  </div>
                </div>

                {user.officialIdDocument && (
                  <div className="md:col-span-2">
                    <div className="text-[10px] text-muted-foreground uppercase">
                      Attached Credentials File
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 p-2 bg-muted/40 rounded-lg border text-xs">
                      <FileText className="h-4 w-4 text-primary" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {user.officialIdDocument.fileName}
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase">
                          {user.officialIdDocument.fileType}
                        </div>
                      </div>
                      <Badge variant="outline" className="rounded-full">
                        Verified Metadata
                      </Badge>
                    </div>
                  </div>
                )}
                <div className="md:col-span-2 grid grid-cols-2 gap-2 mt-2 pt-2 border-t text-xs">
                  <div>
                    <span className="text-muted-foreground">Service Area:</span>{" "}
                    <span className="font-semibold">
                      {user.serviceAreaDistrict || user.district},{" "}
                      {user.serviceAreaState || user.state}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground">Incidents Managed:</span>{" "}
                    <span className="font-semibold text-emergency">
                      {user.approvedIncidentsCount ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {user.role === "authority" && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" /> Public Command Authority
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border bg-card p-4 text-sm">
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">
                    Government Department
                  </div>
                  <div className="font-medium">{user.department || "N/A"}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">
                    Command Designation
                  </div>
                  <div className="font-medium">{user.designation || "N/A"}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">Account Status</div>
                  <div className="font-medium">{user.authorityStatus || "Active"}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">
                    Command Service Area
                  </div>
                  <div className="font-medium">
                    {user.serviceAreaDistrict || user.district},{" "}
                    {user.serviceAreaState || user.state}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rejection Trail if rejected */}
          {user.status === "rejected" && user.rejectionReason && (
            <div className="bg-emergency/5 border border-emergency/25 rounded-xl p-4 text-sm">
              <div className="text-[10px] text-emergency uppercase font-semibold">
                Rejection Explanation
              </div>
              <p className="text-xs font-medium text-foreground mt-1 leading-relaxed">
                "{user.rejectionReason}"
              </p>
              <div className="text-[10px] text-muted-foreground mt-2">
                Processed By: {user.approvedBy || "Administrator"} · Date:{" "}
                {user.approvalDate ? formatDate(user.approvalDate) : "N/A"}
              </div>
            </div>
          )}

          {user.status === "approved" && user.approvedBy && (
            <div className="bg-success/5 border border-success/20 rounded-xl p-3 text-xs text-muted-foreground flex justify-between">
              <span>
                Approved By:{" "}
                <span className="font-semibold text-foreground">{user.approvedBy}</span>
              </span>
              <span>
                Date:{" "}
                <span className="font-semibold text-foreground">
                  {formatDate(user.approvalDate)}
                </span>
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex items-center justify-end gap-2 w-full">{actions}</div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function HeartHandshakeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
      />
    </svg>
  );
}
