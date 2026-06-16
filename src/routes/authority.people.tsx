import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import { API_URL } from "@/lib/config";
import {
  Search,
    UserX,
  Eye,
  MapPin,
  Mail,
  Phone,
  Shield,
      ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {} from "@/lib/utils";

export const Route = createFileRoute("/authority/people")({
  head: () => ({ meta: [{ title: "People Directory — ResQNet" }] }),
  component: AuthorityPeoplePage,
});

function AuthorityPeoplePage() {
  const {} = useAuth();
  const [activeTab, setActiveTab] = useState("requests");
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");

  const [requests, setRequests] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [rescueTeams, setRescueTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Detail Dialog State
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Reject State
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("resqnet.token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      // 1. Fetch pending requests
      const requestsRes = await fetch(`${API_URL}/api/users/requests?status=pending`, { headers });
      if (requestsRes.ok) {
        const reqData = await requestsRes.json();
        setRequests(Array.isArray(reqData) ? reqData : []);
      }

      // 2. Fetch volunteers
      const volsRes = await fetch(`${API_URL}/api/users?role=volunteer`, { headers });
      if (volsRes.ok) {
        const volData = await volsRes.json();
        setVolunteers(Array.isArray(volData) ? volData.filter((v: any) => v.status === "approved") : []);
      }

      // 3. Fetch rescue teams
      const rescueRes = await fetch(`${API_URL}/api/users?role=rescue`, { headers });
      if (rescueRes.ok) {
        const rescueData = await rescueRes.json();
        setRescueTeams(Array.isArray(rescueData) ? rescueData.filter((r: any) => r.status === "approved") : []);
      }
    } catch (err) {
      console.error("Error loading directory data:", err);
      toast.error("Failed to load responder registers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem("resqnet.token");
      const res = await fetch(`${API_URL}/api/users/requests/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: "approved" }),
      });

      if (!res.ok) {
        throw new Error("Approval request failed");
      }

      toast.success("Application approved and responder activated!");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to approve application");
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectId || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      const token = localStorage.getItem("resqnet.token");
      const res = await fetch(`${API_URL}/api/users/requests/${rejectId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: "rejected", rejectionReason }),
      });

      if (!res.ok) {
        throw new Error("Rejection request failed");
      }

      toast.success("Application rejected and status set.");
      setIsRejectOpen(false);
      setRejectId(null);
      setRejectionReason("");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to reject application");
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      const token = localStorage.getItem("resqnet.token");
      // Use the requests status endpoint to toggle back to rejected (deactivated)
      const res = await fetch(`${API_URL}/api/users/requests/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: "rejected", rejectionReason: "Deactivated by command authority." }),
      });

      if (!res.ok) {
        throw new Error("Deactivation failed");
      }

      toast.success("Responder account deactivated.");
      setIsDetailOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to deactivate user");
    }
  };

  const filterList = (list: any[]) => {
    return list.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase()) ||
        (p.mobileNumber && p.mobileNumber.includes(search));

      const matchesState = !stateFilter || p.state === stateFilter;
      const matchesDistrict = !districtFilter || p.district === districtFilter;

      return matchesSearch && matchesState && matchesDistrict;
    });
  };

  return (
    <AppShell title="Responder & Personnel Control">
      <p className="text-muted-foreground -mt-1 mb-6">
        Approve applications, audit volunteer profiles, and coordinate rescue organization credentials.
      </p>

      <div className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-muted/20 border p-3 rounded-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email..."
              className="pl-9 h-10 border-0 bg-background"
            />
          </div>
          <Input
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            placeholder="Filter by State"
            className="h-10 border-0 bg-background"
          />
          <Input
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            placeholder="Filter by District"
            className="h-10 border-0 bg-background"
          />
        </div>

        {/* Tab Selection */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md h-10 bg-muted rounded-xl p-1 shrink-0">
            <TabsTrigger value="requests" className="rounded-lg text-xs font-semibold">
              Pending ({requests.length})
            </TabsTrigger>
            <TabsTrigger value="volunteers" className="rounded-lg text-xs font-semibold">
              Volunteers ({filterList(volunteers).length})
            </TabsTrigger>
            <TabsTrigger value="rescue" className="rounded-lg text-xs font-semibold">
              Rescue squads ({filterList(rescueTeams).length})
            </TabsTrigger>
          </TabsList>

          {/* Pending Applications Tab */}
          <TabsContent value="requests" className="mt-4">
            {loading ? (
              <div className="text-center py-8 text-xs text-muted-foreground">Synchronizing records...</div>
            ) : requests.length === 0 ? (
              <Card className="border-border/60">
                <CardContent className="p-8 text-center text-xs italic text-muted-foreground">
                  No pending registration applications found.
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requests.map((r) => (
                  <Card key={r._id} className="border-border/60 shadow-sm hover:shadow-elegant transition flex flex-col justify-between">
                    <CardHeader className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-sm text-foreground">{r.name}</div>
                        <Badge variant="outline" className="capitalize text-[10px] rounded-full">
                          {r.role}
                        </Badge>
                      </div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <MapPin className="h-3.5 w-3.5" /> {r.district}, {r.state}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                        <div>
                          <span className="font-semibold block text-foreground">Email</span>
                          {r.email}
                        </div>
                        <div>
                          <span className="font-semibold block text-foreground">Phone</span>
                          {r.mobileNumber}
                        </div>
                        {r.role === "volunteer" && (
                          <div className="col-span-2">
                            <span className="font-semibold block text-foreground">Skills</span>
                            {r.skills?.join(", ") || "General Help"}
                          </div>
                        )}
                        {r.role === "rescue" && (
                          <>
                            <div>
                              <span className="font-semibold block text-foreground">Org Name</span>
                              {r.organizationName || "Government"}
                            </div>
                            <div>
                              <span className="font-semibold block text-foreground">Designation</span>
                              {r.designation}
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-2 border-t pt-3 mt-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedPerson(r);
                            setIsDetailOpen(true);
                          }}
                          className="h-8 text-xs gap-1 rounded-full"
                        >
                          <Eye className="h-3.5 w-3.5" /> View Profile
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setRejectId(r._id);
                            setIsRejectOpen(true);
                          }}
                          className="h-8 text-xs gap-1 text-emergency hover:bg-emergency/5 rounded-full"
                        >
                          <ThumbsDown className="h-3.5 w-3.5" /> Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(r._id)}
                          className="h-8 text-xs gap-1 bg-success hover:bg-success/90 rounded-full"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" /> Approve
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Volunteers Tab */}
          <TabsContent value="volunteers" className="mt-4">
            {loading ? (
              <div className="text-center py-8 text-xs text-muted-foreground">Loading volunteers directory...</div>
            ) : filterList(volunteers).length === 0 ? (
              <div className="text-center py-8 text-xs italic text-muted-foreground">No volunteers found matching filters.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filterList(volunteers).map((v) => (
                  <Card key={v._id} className="border-border/60 shadow-sm flex flex-col justify-between">
                    <CardHeader className="p-4 border-b">
                      <div className="font-bold text-sm">{v.name}</div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 shrink-0" /> {v.district}, {v.state}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <div className="text-[11px] space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="h-3.5 w-3.5 shrink-0" /> {v.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 shrink-0" /> {v.mobileNumber}
                        </div>
                      </div>

                      <div className="border-t pt-2 mt-2 flex justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedPerson(v);
                            setIsDetailOpen(true);
                          }}
                          className="h-7 text-xs rounded-full gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" /> Profile Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Rescue Teams Tab */}
          <TabsContent value="rescue" className="mt-4">
            {loading ? (
              <div className="text-center py-8 text-xs text-muted-foreground">Loading rescue squads...</div>
            ) : filterList(rescueTeams).length === 0 ? (
              <div className="text-center py-8 text-xs italic text-muted-foreground">No rescue squads found matching filters.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filterList(rescueTeams).map((r) => (
                  <Card key={r._id} className="border-border/60 shadow-sm flex flex-col justify-between">
                    <CardHeader className="p-4 border-b">
                      <div className="font-bold text-sm">{r.name}</div>
                      <div className="text-[10px] text-muted-foreground">{r.organizationName || "Command Force"} · {r.designation}</div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <div className="text-[11px] space-y-1">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0" /> {r.district}, {r.state}
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 shrink-0" /> {r.mobileNumber}
                        </div>
                      </div>

                      <div className="border-t pt-2 mt-2 flex justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedPerson(r);
                            setIsDetailOpen(true);
                          }}
                          className="h-7 text-xs rounded-full gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" /> Profile Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* VIEW PROFILE DIALOG */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-1.5">
              <Shield className="h-5 w-5 text-primary" /> Responder Profile
            </DialogTitle>
          </DialogHeader>

          {selectedPerson && (
            <div className="space-y-4 py-3 text-xs">
              <div className="border-b pb-3 space-y-1">
                <div className="text-base font-bold text-foreground">{selectedPerson.name}</div>
                <Badge variant="secondary" className="capitalize rounded-full text-[10px]">
                  Role: {selectedPerson.role}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-0.5">
                  <span className="text-muted-foreground font-semibold block uppercase text-[9px]">Contact Info</span>
                  <div className="font-medium text-foreground">{selectedPerson.email}</div>
                  <div className="font-medium text-foreground">{selectedPerson.mobileNumber}</div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-muted-foreground font-semibold block uppercase text-[9px]">Jurisdiction</span>
                  <div className="font-medium text-foreground">{selectedPerson.district}, {selectedPerson.state}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{selectedPerson.address}</div>
                </div>

                {selectedPerson.role === "volunteer" && (
                  <>
                    <div className="col-span-2 space-y-0.5 border-t pt-2">
                      <span className="text-muted-foreground font-semibold block uppercase text-[9px]">Specialized Skills</span>
                      <div className="font-medium text-foreground">{selectedPerson.skills?.join(", ") || "General Emergency Relief"}</div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-muted-foreground font-semibold block uppercase text-[9px]">Availability</span>
                      <div className="font-medium text-foreground capitalize">{selectedPerson.availability || "On Call"}</div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-muted-foreground font-semibold block uppercase text-[9px]">Age / Gender</span>
                      <div className="font-medium text-foreground">{selectedPerson.age || "N/A"} · {selectedPerson.gender || "N/A"}</div>
                    </div>
                  </>
                )}

                {selectedPerson.role === "rescue" && (
                  <>
                    <div className="col-span-2 space-y-0.5 border-t pt-2">
                      <span className="text-muted-foreground font-semibold block uppercase text-[9px]">Organization / Squad Details</span>
                      <div className="font-medium text-foreground">{selectedPerson.organizationName || "Emergency Task Force"}</div>
                      <div className="text-[10px] text-muted-foreground">{selectedPerson.designation} · Spec: {selectedPerson.specialization || "General Dispatches"}</div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-muted-foreground font-semibold block uppercase text-[9px]">Employee ID</span>
                      <div className="font-medium text-foreground font-mono">{selectedPerson.employeeId || "ETF-PENDING"}</div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-muted-foreground font-semibold block uppercase text-[9px]">Experience</span>
                      <div className="font-medium text-foreground">{selectedPerson.yearsOfExperience || "0"} years</div>
                    </div>
                  </>
                )}
              </div>

              {/* Status and Action Panel */}
              <div className="border-t pt-4 flex justify-between items-center gap-2">
                <Button variant="ghost" onClick={() => setIsDetailOpen(false)} className="rounded-full">
                  Close
                </Button>
                {selectedPerson.status === "approved" && (
                  <Button
                    onClick={() => handleDeactivate(selectedPerson._id)}
                    className="bg-emergency hover:bg-emergency/90 text-white rounded-full"
                  >
                    Deactivate Account
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* REJECT APPLICATION DIALOG */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-1.5">
              <UserX className="h-5 w-5 text-emergency" /> Reject Application
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground font-semibold">Reason for rejection</Label>
              <Textarea
                placeholder="Explain why this credential check failed..."
                value={rejectionReason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex items-center justify-end gap-2 border-t pt-3">
              <Button variant="ghost" onClick={() => setIsRejectOpen(false)} className="rounded-full">
                Cancel
              </Button>
              <Button
                onClick={handleRejectSubmit}
                disabled={!rejectionReason.trim()}
                className="bg-emergency hover:bg-emergency/90 text-white rounded-full"
              >
                Reject Application
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
