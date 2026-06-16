import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PillBadge } from "@/components/feature-page";
import { UserProfileDetails } from "@/components/user-profile-details";
import { LocationSelector } from "@/components/location-selector";
import { CreateUserDialog } from "@/components/create-user-dialog";
import { toast } from "sonner";
import {
  Users,
  Shield,
  UserPlus,
  Search,
  Edit3,
  Trash2,
    Eye,
  Power,
  Lock,
  Plus,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { API_URL } from "@/lib/config";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "User Management — ResQNet Admin" }] }),
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<"users" | "authorities">("users");
  const [users, setUsers] = useState<any[]>([]);
  const [authorities, setAuthorities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Selected User Modal
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Create Authority Modal
  const [createAuthOpen, setCreateAuthOpen] = useState(false);
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authMobile, setAuthMobile] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authConfirmPassword, setAuthConfirmPassword] = useState("");
  const [authState, setAuthState] = useState("Delhi");
  const [authDistrict, setAuthDistrict] = useState("New Delhi");
  const [authDepartment, setAuthDepartment] = useState("Disaster Management Authority");
  const [authDesignation, setAuthDesignation] = useState("Disaster Management Officer");

  // Edit Authority Modal
  const [editAuthUser, setEditAuthUser] = useState<any | null>(null);
  const [editAuthOpen, setEditAuthOpen] = useState(false);

  // User Creation Dialogs
  const [createVolunteerOpen, setCreateVolunteerOpen] = useState(false);
  const [createRescueOpen, setCreateRescueOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("resqnet.token");
      const params = new URLSearchParams();
      if (roleFilter !== "all") params.append("role", roleFilter);
      if (searchQuery) params.append("search", searchQuery);

      const res = await fetch(`${API_URL}/api/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
      toast.error("Error loading users list");
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthorities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("resqnet.token");
      const res = await fetch(`${API_URL}/api/users/authorities`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAuthorities(data);
    } catch (error) {
      console.error(error);
      toast.error("Error loading authority accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    } else {
      fetchAuthorities();
    }
  }, [activeTab, roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleCreateAuthority = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authPassword !== authConfirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const token = localStorage.getItem("resqnet.token");
      const res = await fetch(`${API_URL}/api/users/authority`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: authName,
          email: authEmail,
          mobileNumber: authMobile,
          password: authPassword,
          state: authState,
          district: authDistrict,
          department: authDepartment,
          designation: authDesignation,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create authority");
      }

      toast.success(`Created authority account for ${authName}`);
      setCreateAuthOpen(false);
      // Reset form
      setAuthName("");
      setAuthEmail("");
      setAuthMobile("");
      setAuthPassword("");
      setAuthConfirmPassword("");
      fetchAuthorities();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error creating authority account");
    }
  };

  const handleEditAuthorityClick = (user: any) => {
    setEditAuthUser(user);
    setAuthName(user.name);
    setAuthMobile(user.mobileNumber);
    setAuthState(user.state);
    setAuthDistrict(user.district);
    setAuthDepartment(user.department || "Disaster Management Authority");
    setAuthDesignation(user.designation || "Disaster Management Officer");
    setEditAuthOpen(true);
  };

  const handleUpdateAuthority = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAuthUser) return;

    try {
      const token = localStorage.getItem("resqnet.token");
      const res = await fetch(
        `${API_URL}/api/users/authority/${editAuthUser._id || editAuthUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: authName,
            mobileNumber: authMobile,
            state: authState,
            district: authDistrict,
            department: authDepartment,
            designation: authDesignation,
          }),
        },
      );

      if (!res.ok) {
        throw new Error("Failed to update authority");
      }

      toast.success("Updated authority account");
      setEditAuthOpen(false);
      fetchAuthorities();
    } catch (error) {
      console.error(error);
      toast.error("Error updating authority account");
    }
  };

  const handleUpdateStatus = async (id: string, updates: any) => {
    try {
      const token = localStorage.getItem("resqnet.token");
      const res = await fetch(`${API_URL}/api/users/${id}/role-status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      toast.success("User configuration updated successfully");
      if (activeTab === "users") fetchUsers();
      else fetchAuthorities();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update user profile");
    }
  };

  const handleDeleteAuthority = async (id: string, name: string) => {
    if (!confirm(`Are you absolutely sure you want to delete ${name}'s authority account?`)) return;

    try {
      const token = localStorage.getItem("resqnet.token");
      const res = await fetch(`${API_URL}/api/users/authority/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to delete authority");
      }

      toast.success(`Deleted authority account for ${name}`);
      fetchAuthorities();
    } catch (error) {
      console.error(error);
      toast.error("Error deleting authority account");
    }
  };

  return (
    <AppShell
      title="User Management"
      actions={
        activeTab === "authorities" ? (
          <Button className="rounded-full shadow-glow" onClick={() => setCreateAuthOpen(true)}>
            <UserPlus className="h-4 w-4 mr-1.5" /> Create Authority
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              className="rounded-full shadow-glow bg-success text-white hover:bg-success/90"
              onClick={() => setCreateVolunteerOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1.5" /> Add Volunteer
            </Button>
            <Button
              className="rounded-full shadow-glow bg-primary text-white hover:bg-primary/90"
              onClick={() => setCreateRescueOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1.5" /> Add Rescue Team
            </Button>
          </div>
        )
      }
    >
      <p className="text-muted-foreground -mt-1 mb-6">
        Manage all user accounts, roles, access permissions, and authority nodes.
      </p>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-3 mb-6">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 text-sm font-semibold rounded-full transition ${
            activeTab === "users"
              ? "bg-primary text-primary-foreground shadow-glow"
              : "text-muted-foreground hover:bg-muted/40"
          }`}
        >
          <Users className="h-4 w-4 inline mr-1.5" /> All Accounts
        </button>
        <button
          onClick={() => setActiveTab("authorities")}
          className={`px-4 py-2 text-sm font-semibold rounded-full transition ${
            activeTab === "authorities"
              ? "bg-primary text-primary-foreground shadow-glow"
              : "text-muted-foreground hover:bg-muted/40"
          }`}
        >
          <Shield className="h-4 w-4 inline mr-1.5" /> Authority Management
        </button>
      </div>

      {activeTab === "users" ? (
        <div className="space-y-6">
          {/* Filters for users */}
          <Card className="shadow-elegant border-border/60">
            <CardContent className="p-5">
              <form
                onSubmit={handleSearchSubmit}
                className="grid md:grid-cols-[1.5fr_1fr_auto] gap-3 items-end"
              >
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-semibold">
                    Search Accounts
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search name, email, or mobile..."
                      className="pl-9 h-11 bg-muted/40 border-0"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-semibold">Filter Role</label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="citizen">Citizen</SelectItem>
                      <SelectItem value="volunteer">Volunteer</SelectItem>
                      <SelectItem value="rescue">Rescue Team</SelectItem>
                      <SelectItem value="authority">Authority</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="h-11 rounded-xl px-5 shadow-glow">
                  Search
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card className="shadow-elegant border-border/60">
            <CardContent className="p-0">
              {loading ? (
                <div className="py-16 text-center text-sm text-muted-foreground">
                  Loading accounts...
                </div>
              ) : users.length === 0 ? (
                <div className="py-16 text-center text-sm text-muted-foreground">
                  No accounts found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[760px]">
                    <thead>
                      <tr className="text-xs uppercase tracking-wider text-muted-foreground bg-muted/20 border-b">
                        <th className="text-left font-semibold p-4">Name</th>
                        <th className="text-left font-semibold p-4">Role</th>
                        <th className="text-left font-semibold p-4">Contact</th>
                        <th className="text-left font-semibold p-4">Region</th>
                        <th className="text-left font-semibold p-4">Status</th>
                        <th className="w-24 p-4 text-right" />
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr
                          key={u._id || u.id}
                          className="border-b last:border-0 hover:bg-accent/40 transition"
                        >
                          <td className="p-4 font-semibold">{u.name}</td>
                          <td className="p-4 capitalize">
                            <Badge variant="outline" className="rounded-full font-medium">
                              {u.role}
                            </Badge>
                          </td>
                          <td className="p-4 text-xs">
                            <div>{u.email}</div>
                            <div className="text-muted-foreground mt-0.5">{u.mobileNumber}</div>
                          </td>
                          <td className="p-4 text-xs font-medium">
                            {u.district}, {u.state}
                          </td>
                          <td className="p-4">
                            <PillBadge
                              tone={
                                u.status === "approved"
                                  ? "success"
                                  : u.status === "pending"
                                    ? "warning"
                                    : "emergency"
                              }
                            >
                              {u.status}
                            </PillBadge>
                          </td>
                          <td className="p-4 text-right">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-lg"
                              onClick={() => {
                                setSelectedUser(u);
                                setDetailsOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Authorities Table */}
          <Card className="shadow-elegant border-border/60">
            <CardContent className="p-0">
              <div className="p-5 border-b">
                <h2 className="text-lg font-bold">Command Node Authorities</h2>
              </div>
              {loading ? (
                <div className="py-16 text-center text-sm text-muted-foreground">
                  Loading authority accounts...
                </div>
              ) : authorities.length === 0 ? (
                <div className="py-16 text-center text-sm text-muted-foreground">
                  No authority accounts established yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[760px]">
                    <thead>
                      <tr className="text-xs uppercase tracking-wider text-muted-foreground bg-muted/20 border-b">
                        <th className="text-left font-semibold p-4">Name</th>
                        <th className="text-left font-semibold p-4">Department & Designation</th>
                        <th className="text-left font-semibold p-4">Contact</th>
                        <th className="text-left font-semibold p-4">Jurisdiction</th>
                        <th className="text-left font-semibold p-4">Status</th>
                        <th className="w-32 p-4 text-right" />
                      </tr>
                    </thead>
                    <tbody>
                      {authorities.map((a) => (
                        <tr
                          key={a._id || a.id}
                          className="border-b last:border-0 hover:bg-accent/40 transition"
                        >
                          <td className="p-4 font-semibold">{a.name}</td>
                          <td className="p-4 text-xs font-medium">
                            <div className="font-semibold text-primary">{a.department}</div>
                            <div className="text-muted-foreground mt-0.5">{a.designation}</div>
                          </td>
                          <td className="p-4 text-xs">
                            <div>{a.email}</div>
                            <div className="text-muted-foreground mt-0.5">{a.mobileNumber}</div>
                          </td>
                          <td className="p-4 text-xs">
                            {a.district}, {a.state}
                          </td>
                          <td className="p-4">
                            <PillBadge
                              tone={
                                a.authorityStatus === "Active"
                                  ? "success"
                                  : a.authorityStatus === "Inactive"
                                    ? "warning"
                                    : "emergency"
                              }
                            >
                              {a.authorityStatus || "Active"}
                            </PillBadge>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 rounded-lg"
                                onClick={() => handleEditAuthorityClick(a)}
                                title="Edit Account"
                              >
                                <Edit3 className="h-4 w-4 text-primary" />
                              </Button>

                              {a.authorityStatus === "Active" ? (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 rounded-lg"
                                  onClick={() =>
                                    handleUpdateStatus(a._id || a.id, {
                                      authorityStatus: "Inactive",
                                    })
                                  }
                                  title="Deactivate"
                                >
                                  <Power className="h-4 w-4 text-warning" />
                                </Button>
                              ) : (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 rounded-lg"
                                  onClick={() =>
                                    handleUpdateStatus(a._id || a.id, { authorityStatus: "Active" })
                                  }
                                  title="Activate"
                                >
                                  <Power className="h-4 w-4 text-success" />
                                </Button>
                              )}

                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 rounded-lg"
                                onClick={() =>
                                  handleUpdateStatus(a._id || a.id, {
                                    authorityStatus: "Suspended",
                                  })
                                }
                                title="Suspend"
                              >
                                <Lock className="h-4 w-4 text-emergency" />
                              </Button>

                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 rounded-lg"
                                onClick={() => handleDeleteAuthority(a._id || a.id, a.name)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4 text-emergency" />
                              </Button>
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
        </div>
      )}

      {/* Reusable Profile Modal */}
      <UserProfileDetails
        user={selectedUser}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        actions={
          selectedUser?.role === "authority" && (
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => {
                setDetailsOpen(false);
                handleEditAuthorityClick(selectedUser);
              }}
            >
              <Edit3 className="h-4 w-4 mr-1.5" /> Edit Account
            </Button>
          )
        }
      />

      {/* Create Authority Dialog */}
      <Dialog open={createAuthOpen} onOpenChange={setCreateAuthOpen}>
        <DialogContent className="max-w-lg rounded-2xl glass-strong border shadow-elegant">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Create Command Authority Node</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Create secure authority endpoints for regional monitoring.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAuthority} className="space-y-4 py-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="authName">Full Name</Label>
                <Input
                  id="authName"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="authMobile">Mobile Number</Label>
                <Input
                  id="authMobile"
                  value={authMobile}
                  onChange={(e) => setAuthMobile(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="authEmail">Email Address</Label>
              <Input
                id="authEmail"
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                required
              />
            </div>

            <LocationSelector
              selectedState={authState}
              onStateChange={setAuthState}
              selectedDistrict={authDistrict}
              onDistrictChange={setAuthDistrict}
              stateLabel="State Jurisdiction"
              districtLabel="District Jurisdiction"
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="authDept">Department</Label>
                <Select value={authDepartment} onValueChange={setAuthDepartment}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Disaster Management Authority">
                      Disaster Management Authority
                    </SelectItem>
                    <SelectItem value="Fire Department">Fire Department</SelectItem>
                    <SelectItem value="Police Department">Police Department</SelectItem>
                    <SelectItem value="Health Department">Health Department</SelectItem>
                    <SelectItem value="Municipal Corporation">Municipal Corporation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="authDesig">Designation</Label>
                <Input
                  id="authDesig"
                  value={authDesignation}
                  onChange={(e) => setAuthDesignation(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="authPw">Password</Label>
                <Input
                  id="authPw"
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="authConfirmPw">Confirm Password</Label>
                <Input
                  id="authConfirmPw"
                  type="password"
                  value={authConfirmPassword}
                  onChange={(e) => setAuthConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <DialogFooter className="border-t pt-4">
              <Button
                type="button"
                variant="ghost"
                className="rounded-full"
                onClick={() => setCreateAuthOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-full shadow-glow">
                Create Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Authority Dialog */}
      <Dialog open={editAuthOpen} onOpenChange={setEditAuthOpen}>
        <DialogContent className="max-w-lg rounded-2xl glass-strong border shadow-elegant">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Command Authority Node</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Modify active authority properties.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateAuthority} className="space-y-4 py-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="editAuthName">Full Name</Label>
                <Input
                  id="editAuthName"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="editAuthMobile">Mobile Number</Label>
                <Input
                  id="editAuthMobile"
                  value={authMobile}
                  onChange={(e) => setAuthMobile(e.target.value)}
                  required
                />
              </div>
            </div>

            <LocationSelector
              selectedState={authState}
              onStateChange={setAuthState}
              selectedDistrict={authDistrict}
              onDistrictChange={setAuthDistrict}
              stateLabel="State Jurisdiction"
              districtLabel="District Jurisdiction"
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="editAuthDept">Department</Label>
                <Select value={authDepartment} onValueChange={setAuthDepartment}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Disaster Management Authority">
                      Disaster Management Authority
                    </SelectItem>
                    <SelectItem value="Fire Department">Fire Department</SelectItem>
                    <SelectItem value="Police Department">Police Department</SelectItem>
                    <SelectItem value="Health Department">Health Department</SelectItem>
                    <SelectItem value="Municipal Corporation">Municipal Corporation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="editAuthDesig">Designation</Label>
                <Input
                  id="editAuthDesig"
                  value={authDesignation}
                  onChange={(e) => setAuthDesignation(e.target.value)}
                  required
                />
              </div>
            </div>

            <DialogFooter className="border-t pt-4">
              <Button
                type="button"
                variant="ghost"
                className="rounded-full"
                onClick={() => setEditAuthOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-full shadow-glow">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <CreateUserDialog
        open={createVolunteerOpen}
        onOpenChange={setCreateVolunteerOpen}
        role="volunteer"
        onSuccess={fetchUsers}
      />

      <CreateUserDialog
        open={createRescueOpen}
        onOpenChange={setCreateRescueOpen}
        role="rescue"
        onSuccess={fetchUsers}
      />
    </AppShell>
  );
}
