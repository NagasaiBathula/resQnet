import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { resourceService } from "@/services/resourceService";
import { Boxes, Truck, HeartPulse, Droplet, Plus, Search, Filter, Pencil, Trash2, History, Check, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/authority/resources")({
  head: () => ({ meta: [{ title: "Stockpile Management — ResQNet" }] }),
  component: AuthorityResourcesPage,
});

const RESOURCE_TYPES = [
  "Boat",
  "Ambulance",
  "Rescue Vehicle",
  "Medical Kit",
  "Food Supply",
  "Water Supply",
  "Emergency Shelter Kit",
  "Communication Equipment",
  "Generator",
  "Other"
];

function AuthorityResourcesPage() {
  const [resourcesList, setResourcesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const [selectedResource, setSelectedResource] = useState<any>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    type: "Boat",
    description: "",
    state: "",
    district: ""
  });
  const [newStatus, setNewStatus] = useState("Available");
  const [statusNotes, setStatusNotes] = useState("");

  const loadResources = () => {
    setLoading(true);
    resourceService.getResources()
      .then(data => {
        setResourcesList(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading resources:", err);
        toast.error("Failed to load stockpiles");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.type) {
      toast.error("Please fill in Name and Type");
      return;
    }
    try {
      await resourceService.createResource({
        name: formData.name,
        type: formData.type,
        description: formData.description,
        state: formData.state || "Maharashtra", // Default fallback if empty
        district: formData.district || "Mumbai"
      });
      toast.success("Resource asset registered successfully");
      setIsCreateOpen(false);
      setFormData({ name: "", type: "Boat", description: "", state: "", district: "" });
      loadResources();
    } catch (err: any) {
      toast.error(err.message || "Failed to create resource");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResource) return;
    try {
      await resourceService.updateResource(selectedResource._id, {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        state: formData.state,
        district: formData.district
      });
      toast.success("Resource specifications updated");
      setIsEditOpen(false);
      loadResources();
    } catch (err: any) {
      toast.error(err.message || "Failed to update resource");
    }
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResource) return;
    try {
      await resourceService.updateResourceStatus(selectedResource._id, newStatus, statusNotes);
      toast.success("Resource status updated");
      setIsStatusOpen(false);
      setStatusNotes("");
      loadResources();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this resource asset from stockpiles?")) return;
    try {
      await resourceService.deleteResource(id);
      toast.success("Resource deleted successfully");
      loadResources();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete resource");
    }
  };

  // Open Dialog triggers
  const openEdit = (res: any) => {
    setSelectedResource(res);
    setFormData({
      name: res.name,
      type: res.type,
      description: res.description || "",
      state: res.state,
      district: res.district
    });
    setIsEditOpen(true);
  };

  const openStatus = (res: any) => {
    setSelectedResource(res);
    setNewStatus(res.status);
    setStatusNotes("");
    setIsStatusOpen(true);
  };

  const openHistory = (res: any) => {
    setSelectedResource(res);
    setIsHistoryOpen(true);
  };

  // Local calculations for Stats
  const totalCount = resourcesList.length;
  const availableCount = resourcesList.filter(r => r.status === "Available").length;
  const assignedCount = resourcesList.filter(r => r.status === "Assigned" || r.status === "In Use").length;
  const maintenanceCount = resourcesList.filter(r => r.status === "Maintenance").length;
  const unavailableCount = resourcesList.filter(r => r.status === "Unavailable").length;

  // Filtered List
  const filteredList = resourcesList.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.resourceId.toLowerCase().includes(search.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const matchesType = typeFilter === "all" || r.type === typeFilter;
    const matchesDistrict = !districtFilter || r.district.toLowerCase().includes(districtFilter.toLowerCase());
    const matchesState = !stateFilter || r.state.toLowerCase().includes(stateFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesType && matchesDistrict && matchesState;
  });

  return (
    <AppShell
      title="Stockpile Management"
      actions={
        <Button onClick={() => setIsCreateOpen(true)} className="rounded-full shadow-glow">
          <Plus className="h-4 w-4 mr-1.5" /> Register Asset
        </Button>
      }
    >
      <p className="text-muted-foreground -mt-1 mb-6">
        Monitor operational readiness, track command center assignments, and audit active deployment histories.
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase font-medium">Total Assets</div>
              <div className="text-xl font-bold">{totalCount}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase font-medium">Available</div>
              <div className="text-xl font-bold">{availableCount}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-info/10 text-info flex items-center justify-center shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase font-medium">Deployed</div>
              <div className="text-xl font-bold">{assignedCount}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center shrink-0">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase font-medium">Maintenance</div>
              <div className="text-xl font-bold">{maintenanceCount}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emergency/10 text-emergency flex items-center justify-center shrink-0">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase font-medium">Unavailable</div>
              <div className="text-xl font-bold">{unavailableCount}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border/60 mb-6 shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by asset code, name, description..."
              className="pl-9 h-11 bg-muted/40 border-0 focus-visible:ring-1"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Filter className="h-3.5 w-3.5" /> Filters:
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 rounded-full border bg-background px-3 text-xs focus:ring-1"
            >
              <option value="all">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Assigned">Assigned</option>
              <option value="In Use">In Use</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Unavailable">Unavailable</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-8 rounded-full border bg-background px-3 text-xs focus:ring-1"
            >
              <option value="all">All Types</option>
              {RESOURCE_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <Input
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              placeholder="Filter District..."
              className="h-8 w-36 rounded-full border px-3 text-xs"
            />

            <Input
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              placeholder="Filter State..."
              className="h-8 w-36 rounded-full border px-3 text-xs"
            />

            {(search || statusFilter !== "all" || typeFilter !== "all" || districtFilter || stateFilter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                  setDistrictFilter("");
                  setStateFilter("");
                }}
                className="h-8 text-xs rounded-full px-3 text-muted-foreground"
              >
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Stockpile Table */}
      {loading ? (
        <div className="flex h-[300px] items-center justify-center">
          <div className="animate-pulse text-muted-foreground text-sm font-medium">Loading stockpiles...</div>
        </div>
      ) : filteredList.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="p-8 text-center flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-muted grid place-items-center mb-4 text-muted-foreground">
              <Boxes className="h-6 w-6" />
            </div>
            <div className="font-semibold text-lg">No assets registered</div>
            <p className="text-muted-foreground text-sm mt-1 max-w-sm">
              We couldn't find any resources matching your parameters in local stockpiles.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/60 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-muted/40 text-muted-foreground text-xs uppercase font-semibold border-b">
                <tr>
                  <th className="p-4">Asset Code</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Location (District/State)</th>
                  <th className="p-4">Deployments</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredList.map((res) => (
                  <tr key={res._id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-mono text-xs font-semibold text-primary">{res.resourceId}</td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-foreground">{res.name}</div>
                        {res.description && <div className="text-xs text-muted-foreground truncate max-w-xs">{res.description}</div>}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary" className="rounded-md px-1.5 py-0.5 text-xs font-normal">
                        {res.type}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-medium border capitalize",
                        res.status === "Available" ? "bg-success/15 text-success border-success/20" :
                        res.status === "In Use" ? "bg-emergency/15 text-emergency border-emergency/25" :
                        res.status === "Assigned" ? "bg-info/15 text-info border-info/25" :
                        res.status === "Maintenance" ? "bg-warning/15 text-warning border-warning/20" :
                        "bg-muted text-muted-foreground border-border"
                      )}>
                        {res.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="text-xs">
                        <span className="font-medium">{res.district}</span>, <span className="text-muted-foreground">{res.state}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{res.totalAssignments}</span> assignments
                        {res.totalUsageHours > 0 && <span className="block text-[10px]">({res.totalUsageHours} hrs total)</span>}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => openStatus(res)} title="Update Status">
                          <Check className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => openHistory(res)} title="View Logs & History">
                          <History className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => openEdit(res)} title="Edit Specifications">
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-emergency hover:bg-emergency/5" onClick={() => handleDelete(res._id)} title="Delete Asset">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Dialogs */}

      {/* CREATE DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md rounded-2xl border shadow-elegant">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle className="font-bold text-lg">Register Stockpile Asset</DialogTitle>
              <DialogDescription className="text-xs">Add emergency supplies, medical vehicles, or rescue craft to command inventories.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="res-name" className="text-xs font-semibold text-muted-foreground">Asset Name</Label>
                <Input
                  id="res-name"
                  placeholder="e.g. Mumbai NDRF Boat #3"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="res-type" className="text-xs font-semibold text-muted-foreground">Category Type</Label>
                <select
                  id="res-type"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full h-10 rounded-lg border bg-background px-3 py-1.5 text-sm focus:ring-1"
                >
                  {RESOURCE_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="res-dist" className="text-xs font-semibold text-muted-foreground">District Location</Label>
                  <Input
                    id="res-dist"
                    placeholder="e.g. Mumbai"
                    value={formData.district}
                    onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="res-state" className="text-xs font-semibold text-muted-foreground">State Location</Label>
                  <Input
                    id="res-state"
                    placeholder="e.g. Maharashtra"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="res-desc" className="text-xs font-semibold text-muted-foreground">Description & Notes</Label>
                <Textarea
                  id="res-desc"
                  placeholder="Provide registration details, capacities, specs or operator scopes..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-full">
                Cancel
              </Button>
              <Button type="submit" className="rounded-full shadow-glow">
                Register Stockpile
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md rounded-2xl border shadow-elegant">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle className="font-bold text-lg">Edit Asset Specifications</DialogTitle>
              <DialogDescription className="text-xs">Modify parameters for registered resource code {selectedResource?.resourceId}.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="edit-name" className="text-xs font-semibold text-muted-foreground">Asset Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-type" className="text-xs font-semibold text-muted-foreground">Category Type</Label>
                <select
                  id="edit-type"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full h-10 rounded-lg border bg-background px-3 py-1.5 text-sm focus:ring-1"
                >
                  {RESOURCE_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="edit-dist" className="text-xs font-semibold text-muted-foreground">District Location</Label>
                  <Input
                    id="edit-dist"
                    value={formData.district}
                    onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-state" className="text-xs font-semibold text-muted-foreground">State Location</Label>
                  <Input
                    id="edit-state"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-desc" className="text-xs font-semibold text-muted-foreground">Description & Notes</Label>
                <Textarea
                  id="edit-desc"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="rounded-full">
                Cancel
              </Button>
              <Button type="submit" className="rounded-full shadow-glow">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* STATUS UPDATE DIALOG */}
      <Dialog open={isStatusOpen} onOpenChange={setIsStatusOpen}>
        <DialogContent className="max-w-md rounded-2xl border shadow-elegant">
          <form onSubmit={handleStatusSubmit}>
            <DialogHeader>
              <DialogTitle className="font-bold text-lg">Update Asset Status</DialogTitle>
              <DialogDescription className="text-xs">Adjust operational state of resource {selectedResource?.resourceId}.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="status-select" className="text-xs font-semibold text-muted-foreground">Operational Status</Label>
                <select
                  id="status-select"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full h-10 rounded-lg border bg-background px-3 py-1.5 text-sm focus:ring-1"
                >
                  <option value="Available">Available</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Use">In Use</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="status-notes" className="text-xs font-semibold text-muted-foreground">Log Notes</Label>
                <Textarea
                  id="status-notes"
                  placeholder="State reason for status change (e.g. routine oil check, generator failure, resolved and ready)..."
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsStatusOpen(false)} className="rounded-full">
                Cancel
              </Button>
              <Button type="submit" className="rounded-full shadow-glow">
                Apply Status
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* HISTORY & LOGS INSPECTOR DIALOG */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl border shadow-elegant">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="font-bold text-lg flex items-center gap-1.5">
              <History className="h-5 w-5 text-primary" /> Asset Activity & Deployment Records
            </DialogTitle>
            <DialogDescription className="text-xs">
              Audit trail and utilization metrics for stockpile asset {selectedResource?.resourceId} ({selectedResource?.name}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-3 bg-muted/30 border p-3 rounded-xl">
              <div className="text-center">
                <div className="text-[10px] text-muted-foreground uppercase font-medium">Deployments</div>
                <div className="text-lg font-bold text-foreground">{selectedResource?.totalAssignments || 0}</div>
              </div>
              <div className="text-center border-x">
                <div className="text-[10px] text-muted-foreground uppercase font-medium">Usage Hours</div>
                <div className="text-lg font-bold text-foreground">{selectedResource?.totalUsageHours || 0} hrs</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-muted-foreground uppercase font-medium">Last Used</div>
                <div className="text-xs font-semibold text-foreground truncate mt-1">
                  {selectedResource?.lastUsedAt ? new Date(selectedResource.lastUsedAt).toLocaleDateString() : "Never"}
                </div>
              </div>
            </div>

            {/* Deployment Incident History */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Deployment History</h4>
              {!selectedResource?.assignmentHistory || selectedResource.assignmentHistory.length === 0 ? (
                <div className="text-xs italic text-muted-foreground bg-muted/10 p-3 border rounded-lg">
                  No historical assignments to incidents recorded.
                </div>
              ) : (
                <div className="border rounded-xl overflow-hidden bg-background/50 text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-muted text-muted-foreground font-semibold">
                      <tr>
                        <th className="p-2">Incident Number</th>
                        <th className="p-2">Assigned At</th>
                        <th className="p-2">Released At</th>
                        <th className="p-2">Dispatched By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedResource.assignmentHistory.map((h: any, i: number) => (
                        <tr key={i} className="hover:bg-muted/20">
                          <td className="p-2 font-semibold text-primary">{h.incidentNumber}</td>
                          <td className="p-2 text-muted-foreground">{new Date(h.assignedAt).toLocaleString()}</td>
                          <td className="p-2 text-muted-foreground">
                            {h.releasedAt ? new Date(h.releasedAt).toLocaleString() : <Badge variant="secondary" className="bg-info/10 text-info text-[9px] px-1 py-0 border-info/20">Active</Badge>}
                          </td>
                          <td className="p-2 text-muted-foreground capitalize">{h.assignedByRole}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Audit Logs */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Audit activity logs</h4>
              {!selectedResource?.resourceActivityLog || selectedResource.resourceActivityLog.length === 0 ? (
                <div className="text-xs italic text-muted-foreground bg-muted/10 p-3 border rounded-lg">
                  No activity log records found.
                </div>
              ) : (
                <div className="relative border-l border-muted-foreground/20 pl-4 ml-2.5 space-y-4 py-1">
                  {selectedResource.resourceActivityLog.map((log: any, idx: number) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[23px] top-1 h-2.5 w-2.5 rounded-full bg-primary border border-background" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-foreground">{log.action}</span>
                          <span className="text-[9px] text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          By: <span className="font-medium text-foreground">{log.performedByRole}</span>
                        </div>
                        {log.notes && <p className="text-[11px] mt-0.5 text-muted-foreground italic bg-muted/10 p-1.5 border rounded-md">{log.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="border-t pt-3">
            <Button variant="outline" onClick={() => setIsHistoryOpen(false)} className="rounded-full">
              Close Inspection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
