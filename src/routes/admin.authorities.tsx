import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { API_URL } from "@/lib/config";
import {
  Search,
  Plus,
  Shield,
    ShieldOff,
      Mail,
  Phone,
  Trash2,
  Pencil,
  Building,
  MapPin,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/authorities")({
  head: () => ({ meta: [{ title: "Manage Authorities — ResQNet" }] }),
  component: AdminAuthoritiesPage,
});

function AdminAuthoritiesPage() {
  const [authorities, setAuthorities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedAuthority, setSelectedAuthority] = useState<any>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    password: "",
    state: "",
    district: "",
    department: "",
    designation: "",
  });

  const fetchAuthorities = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("resqnet.token");
      const res = await fetch(`${API_URL}/api/users?role=authority`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setAuthorities(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching authorities:", err);
      toast.error("Failed to load authorities registry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthorities();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, password, mobileNumber, state, district, department, designation } = formData;
    if (!name || !email || !password || !mobileNumber || !state || !district || !department || !designation) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const token = localStorage.getItem("resqnet.token");
      const res = await fetch(`${API_URL}/api/users/authority`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to create authority account");
      }

      toast.success("Regional Authority registered successfully!");
      setIsCreateOpen(false);
      setFormData({
        name: "",
        email: "",
        mobileNumber: "",
        password: "",
        state: "",
        district: "",
        department: "",
        designation: "",
      });
      fetchAuthorities();
    } catch (err: any) {
      toast.error(err.message || "Error creating authority");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAuthority) return;

    try {
      const token = localStorage.getItem("resqnet.token");
      const res = await fetch(`${API_URL}/api/users/authority/${selectedAuthority._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: formData.name,
          mobileNumber: formData.mobileNumber,
          state: formData.state,
          district: formData.district,
          department: formData.department,
          designation: formData.designation,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update authority");
      }

      toast.success("Authority details updated");
      setIsEditOpen(false);
      fetchAuthorities();
    } catch (err: any) {
      toast.error(err.message || "Error updating authority");
    }
  };

  const toggleStatus = async (auth: any) => {
    const nextStatus = auth.authorityStatus === "Active" ? "Suspended" : "Active";
    try {
      const token = localStorage.getItem("resqnet.token");
      const res = await fetch(`${API_URL}/api/users/authority/${auth._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ authorityStatus: nextStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to change status");
      }

      toast.success(`Authority status updated to ${nextStatus}`);
      fetchAuthorities();
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle authority status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this authority account? This action cannot be undone.")) return;

    try {
      const token = localStorage.getItem("resqnet.token");
      const res = await fetch(`${API_URL}/api/users/authority/${id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete authority");
      }

      toast.success("Authority account deleted successfully");
      fetchAuthorities();
    } catch (err: any) {
      toast.error(err.message || "Error deleting authority");
    }
  };

  const filtered = authorities.filter((auth) => {
    const term = search.toLowerCase();
    return (
      auth.name.toLowerCase().includes(term) ||
      auth.email.toLowerCase().includes(term) ||
      auth.district.toLowerCase().includes(term) ||
      auth.state.toLowerCase().includes(term) ||
      (auth.department && auth.department.toLowerCase().includes(term))
    );
  });

  return (
    <AppShell
      title="Regional Authorities Registry"
      actions={
        <Button onClick={() => setIsCreateOpen(true)} className="rounded-full shadow-glow gap-1.5 text-xs">
          <Plus className="h-4 w-4" /> Register Authority
        </Button>
      }
    >
      <p className="text-muted-foreground -mt-1 mb-6">
        Configure and register regional disaster management command centers, approve state credentials, and toggle status.
      </p>

      {/* Search Filter */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by center name, district, or department..."
          className="pl-9 bg-muted/20 border-0"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-muted-foreground">Syncing credentials...</div>
      ) : filtered.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="p-8 text-center text-xs italic text-muted-foreground">
            No regional authority centers registered matching current filters.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((auth) => (
            <Card key={auth._id} className="border-border/60 shadow-sm flex flex-col justify-between hover:shadow-elegant transition">
              <CardHeader className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-foreground">{auth.name}</div>
                  <Badge
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] uppercase font-semibold",
                      auth.authorityStatus === "Active" ? "bg-success" : "bg-emergency",
                    )}
                  >
                    {auth.authorityStatus || "Active"}
                  </Badge>
                </div>
                <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3.5 w-3.5" /> Jurisdiction: {auth.district}, {auth.state}
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                  <div>
                    <span className="font-semibold block text-foreground">Department</span>
                    {auth.department || "Disaster Management"}
                  </div>
                  <div>
                    <span className="font-semibold block text-foreground">Designation</span>
                    {auth.designation || "Officer"}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Mail className="h-3.5 w-3.5" /> {auth.email}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Phone className="h-3.5 w-3.5" /> {auth.mobileNumber}
                  </div>
                </div>

                <div className="border-t pt-3 flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedAuthority(auth);
                      setFormData({
                        name: auth.name,
                        email: auth.email,
                        mobileNumber: auth.mobileNumber,
                        password: "",
                        state: auth.state,
                        district: auth.district,
                        department: auth.department || "",
                        designation: auth.designation || "",
                      });
                      setIsEditOpen(true);
                    }}
                    className="h-8 text-xs gap-1 rounded-full"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleStatus(auth)}
                    className={cn(
                      "h-8 text-xs gap-1 rounded-full",
                      auth.authorityStatus === "Active"
                        ? "text-warning hover:bg-warning/5"
                        : "text-success hover:bg-success/5",
                    )}
                  >
                    {auth.authorityStatus === "Active" ? (
                      <>
                        <ShieldOff className="h-3.5 w-3.5" /> Suspend
                      </>
                    ) : (
                      <>
                        <Shield className="h-3.5 w-3.5" /> Activate
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(auth._id)}
                    className="h-8 text-xs gap-1 text-emergency hover:bg-emergency/5 rounded-full"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* REGISTER AUTHORITY DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-1.5">
                <Building className="h-5 w-5 text-primary" /> Register Command Center
              </DialogTitle>
              <DialogDescription className="text-xs">
                Create a trusted regional Disaster Management Authority account.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Center / Officer Name</Label>
                <Input
                  required
                  placeholder="e.g. Mumbai Disaster Management Office"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Email Address</Label>
                  <Input
                    required
                    type="email"
                    placeholder="officer@resqnet.gov.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Temporary Password</Label>
                  <Input
                    required
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Mobile Number</Label>
                  <Input
                    required
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Department</Label>
                  <Input
                    required
                    placeholder="Disaster Control"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Officer Designation</Label>
                  <Input
                    required
                    placeholder="Commanding Officer"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">State Jurisdiction</Label>
                  <Input
                    required
                    placeholder="Maharashtra"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">District Jurisdiction</Label>
                <Input
                  required
                  placeholder="Mumbai"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter className="border-t pt-4">
              <Button type="button" variant="ghost" className="rounded-full" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-full shadow-glow">
                Register Center
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT AUTHORITY DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Edit Command Center specifications</DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Center / Officer Name</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Mobile Number</Label>
                  <Input
                    required
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Department</Label>
                  <Input
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Officer Designation</Label>
                  <Input
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">State Jurisdiction</Label>
                  <Input
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">District Jurisdiction</Label>
                <Input
                  required
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter className="border-t pt-4">
              <Button type="button" variant="ghost" className="rounded-full" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-full shadow-glow">
                Apply Specifications
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
