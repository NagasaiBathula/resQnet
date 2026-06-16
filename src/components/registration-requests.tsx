import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PillBadge } from "./feature-page";
import { UserProfileDetails } from "./user-profile-details";
import { toast } from "sonner";
import { Search, Check, X, Eye, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { API_URL } from "@/lib/config";

export function RegistrationRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters and search
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals state
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Rejection modal state
  const [rejectUser, setRejectUser] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState("Verification Failed");
  const [customReason, setCustomReason] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("resqnet.token");

      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (roleFilter !== "all") params.append("role", roleFilter);
      if (searchQuery) params.append("search", searchQuery);

      const res = await fetch(`${API_URL}/api/users/requests?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch requests");
      }

      const data = await res.json();
      setRequests(data);
    } catch (error) {
      console.error(error);
      toast.error("Error loading registration requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRequests();
  };

  const handleApprove = async (id: string, name: string) => {
    try {
      const token = localStorage.getItem("resqnet.token");
      const res = await fetch(`${API_URL}/api/users/requests/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "approved" }),
      });

      if (!res.ok) {
        throw new Error("Failed to approve application");
      }

      toast.success(`Approved ${name}'s application`);
      setDetailsOpen(false);
      fetchRequests();
    } catch (error) {
      console.error(error);
      toast.error("Error approving registration");
    }
  };

  const handleRejectClick = (user: any) => {
    setRejectUser(user);
    setRejectionReason("Verification Failed");
    setCustomReason("");
    setRejectOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectUser) return;

    const finalReason = rejectionReason === "Other" ? customReason : rejectionReason;
    if (!finalReason.trim()) {
      toast.error("Please specify a rejection reason");
      return;
    }

    try {
      const token = localStorage.getItem("resqnet.token");
      const res = await fetch(
        `${API_URL}/api/users/requests/${rejectUser._id || rejectUser.id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "rejected",
            rejectionReason: finalReason,
          }),
        },
      );

      if (!res.ok) {
        throw new Error("Failed to reject application");
      }

      toast.error(`Rejected ${rejectUser.name}'s application`);
      setRejectOpen(false);
      setDetailsOpen(false);
      fetchRequests();
    } catch (error) {
      console.error(error);
      toast.error("Error rejecting registration");
    }
  };

  const openDetails = (user: any) => {
    setSelectedUser(user);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="shadow-elegant border-border/60">
        <CardContent className="p-5">
          <form
            onSubmit={handleSearchSubmit}
            className="grid md:grid-cols-[1.5fr_1fr_1fr_auto] gap-3 items-end"
          >
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-semibold">
                Search Applicant
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or mobile..."
                  className="pl-9 h-11 bg-muted/40 border-0"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-semibold">Filter Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending Applications</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="all">All Statuses</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-semibold">Filter Role</label>
              <Select value={roleFilter} onValueChange={(roleFilter) => setRoleFilter(roleFilter)}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="volunteer">Volunteer</SelectItem>
                  <SelectItem value="rescue">Rescue Team</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="h-11 rounded-xl px-5 shadow-glow">
              Apply Filters
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card className="shadow-elegant border-border/60">
        <CardContent className="p-0">
          <div className="p-5 border-b flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight">Registration Requests</h2>
            <Badge variant="secondary" className="rounded-full">
              {requests.length} Application{requests.length === 1 ? "" : "s"}
            </Badge>
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              Loading applications...
            </div>
          ) : requests.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground border-b last:border-0">
              No registration requests found matching current filter selections.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[760px]">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-muted-foreground bg-muted/20 border-b">
                    <th className="text-left font-semibold p-4">Applicant Name</th>
                    <th className="text-left font-semibold p-4">Contact Info</th>
                    <th className="text-left font-semibold p-4">Role Request</th>
                    <th className="text-left font-semibold p-4">Region (State/Dist)</th>
                    <th className="text-left font-semibold p-4">Reg Date</th>
                    <th className="text-left font-semibold p-4">Status</th>
                    <th className="w-24 p-4 text-right" />
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr
                      key={r._id || r.id}
                      className="border-b last:border-0 hover:bg-accent/40 transition"
                    >
                      <td className="p-4 font-semibold">{r.name}</td>
                      <td className="p-4 text-xs">
                        <div>{r.email}</div>
                        <div className="text-muted-foreground mt-0.5">{r.mobileNumber}</div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="rounded-full capitalize font-medium">
                          {r.role}
                        </Badge>
                      </td>
                      <td className="p-4 text-xs font-medium">
                        {r.district}, {r.state}
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">
                        {new Date(r.createdAt || r.registrationDate).toLocaleDateString("en-IN")}
                      </td>
                      <td className="p-4">
                        <PillBadge
                          tone={
                            r.status === "approved"
                              ? "success"
                              : r.status === "pending"
                                ? "warning"
                                : "emergency"
                          }
                        >
                          {r.status}
                        </PillBadge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-lg"
                            onClick={() => openDetails(r)}
                            title="Inspect Application"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {r.status === "pending" && (
                            <>
                              <Button
                                size="icon"
                                className="h-8 w-8 bg-success/10 text-success hover:bg-success/20 rounded-lg border-0"
                                onClick={() => handleApprove(r._id || r.id, r.name)}
                                title="Approve Request"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                className="h-8 w-8 bg-emergency/10 text-emergency hover:bg-emergency/20 rounded-lg border-0"
                                onClick={() => handleRejectClick(r)}
                                title="Reject Request"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inspect Modal Details */}
      <UserProfileDetails
        user={selectedUser}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        actions={
          selectedUser?.status === "pending" && (
            <>
              <Button
                variant="ghost"
                className="rounded-full text-emergency hover:text-emergency hover:bg-emergency/5"
                onClick={() => handleRejectClick(selectedUser)}
              >
                <X className="h-4 w-4 mr-1.5" /> Reject Request
              </Button>
              <Button
                className="rounded-full bg-success text-white hover:bg-success/90 shadow-glow"
                onClick={() =>
                  handleApprove(selectedUser._id || selectedUser.id, selectedUser.name)
                }
              >
                <Check className="h-4 w-4 mr-1.5" /> Approve Request
              </Button>
            </>
          )
        }
      />

      {/* Rejection Reasons Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-md rounded-2xl glass-strong border shadow-elegant">
          <DialogHeader>
            <div className="h-10 w-10 rounded-full bg-emergency/15 text-emergency flex items-center justify-center mb-3">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-bold">Specify Rejection Reason</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Please declare the audit reason for rejecting {rejectUser?.name}'s application.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3 text-sm">
            <div className="space-y-1.5">
              <Label htmlFor="rejectReason">Rejection Category</Label>
              <Select value={rejectionReason} onValueChange={setRejectionReason}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select Reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Verification Failed">Verification Failed</SelectItem>
                  <SelectItem value="Invalid Information">Invalid Information</SelectItem>
                  <SelectItem value="Duplicate Application">Duplicate Application</SelectItem>
                  <SelectItem value="Other">Other Reason (Provide details)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {rejectionReason === "Other" && (
              <div className="space-y-1.5 animate-fade-in">
                <Label htmlFor="customReason">Custom Reason Details</Label>
                <Input
                  id="customReason"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="e.g. Expired credentials provided."
                  className="h-11"
                  required
                />
              </div>
            )}
          </div>

          <DialogFooter className="border-t pt-4">
            <Button variant="ghost" className="rounded-full" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              className="rounded-full bg-emergency text-white hover:bg-emergency/90 shadow-glow"
              onClick={handleRejectSubmit}
            >
              Submit Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
