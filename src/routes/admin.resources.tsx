import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { resourceService } from "@/services/resourceService";
import {
  Boxes,
  Truck,
      Plus,
  Search,
  Pencil,
  Trash2,
  History,
  Check,
  ArrowRightLeft,
    } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/resources")({
  head: () => ({ meta: [{ title: "Global Stockpiles & Audits — ResQNet" }] }),
  component: AdminResourcesPage,
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
  "Other",
];

function AdminResourcesPage() {
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
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  const [selectedResource, setSelectedResource] = useState<any>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    type: "Boat",
    description: "",
    state: "",
    district: "",
    managedByState: "",
    managedByDistrict: "",
  });
  const [newStatus, setNewStatus] = useState("Available");
  const [statusNotes, setStatusNotes] = useState("");
  
  // Transfer states
  const [transferData, setTransferData] = useState({
    state: "",
    district: "",
    managedByState: "",
    managedByDistrict: "",
    sameAsManaging: true,
  });

  const loadResources = () => {
    setLoading(true);
    resourceService
      .getResources()
      .then((data) => {
        setResourcesList(data);
        setLoading(false);
      })
      .catch((err) => {
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
    if (!formData.name || !formData.type || !formData.state || !formData.district) {
      toast.error("Please fill in Name, Type, State, and District");
      return;
    }
    
    const resourceState = formData.state;
    const resourceDistrict = formData.district;


    try {
      await resourceService.createResource({
        name: formData.name,
        type: formData.type,
        description: formData.description,
        state: resourceState,
        district: resourceDistrict,
        // Since createResource only accepts CreateResourceInput, we will also update it right after if needed,
        // but let's check: the endpoint in POST /api/resources pre-fills managedByState/managedByDistrict to req.user.state/district.
        // Wait, for an admin req.user has state/district. If admin wants different manager, they can update it.
      });

      toast.success("Resource asset registered successfully");
      setIsCreateOpen(false);
      setFormData({
        name: "",
        type: "Boat",
        description: "",
        state: "",
        district: "",
        managedByState: "",
        managedByDistrict: "",
      });
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
        district: formData.district,
        managedByState: formData.managedByState || selectedResource.managedByState,
        managedByDistrict: formData.managedByDistrict || selectedResource.managedByDistrict,
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
      toast.success("Resource status updated successfully");
      setIsStatusOpen(false);
      setStatusNotes("");
      loadResources();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleRelease = async (res: any) => {
    if (!window.confirm(`Are you sure you want to override and release ${res.resourceId} from its assigned incident?`)) {
      return;
    }
    try {
      await resourceService.releaseResource(res._id);
      toast.success("Resource assignment overridden and released");
      loadResources();
    } catch (err: any) {
      toast.error(err.message || "Failed to release resource");
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResource) return;
    if (!transferData.state || !transferData.district) {
      toast.error("Please fill in Target State and District");
      return;
    }

    const mState = transferData.sameAsManaging ? transferData.state : (transferData.managedByState || transferData.state);
    const mDistrict = transferData.sameAsManaging ? transferData.district : (transferData.managedByDistrict || transferData.district);

    try {
      await resourceService.updateResource(selectedResource._id, {
        state: transferData.state,
        district: transferData.district,
        managedByState: mState,
        managedByDistrict: mDistrict,
      });
      toast.success(`Resource transferred to ${transferData.district}, ${transferData.state} successfully`);
      setIsTransferOpen(false);
      loadResources();
    } catch (err: any) {
      toast.error(err.message || "Failed to transfer jurisdiction");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this resource asset from platform stockpiles?"))
      return;
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
      district: res.district,
      managedByState: res.managedByState || "",
      managedByDistrict: res.managedByDistrict || "",
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

  const openTransfer = (res: any) => {
    setSelectedResource(res);
    setTransferData({
      state: res.state,
      district: res.district,
      managedByState: res.managedByState || res.state,
      managedByDistrict: res.managedByDistrict || res.district,
      sameAsManaging: res.state === res.managedByState && res.district === res.managedByDistrict,
    });
    setIsTransferOpen(true);
  };

  // Local calculations for Stats
  const totalCount = resourcesList.length;
  const availableCount = resourcesList.filter((r) => r.status === "Available").length;
  const assignedCount = resourcesList.filter(
    (r) => r.status === "Assigned" || r.status === "In Use",
  ).length;
  const maintenanceCount = resourcesList.filter((r) => r.status === "Maintenance").length;
  const unavailableCount = resourcesList.filter((r) => r.status === "Unavailable").length;

  // Filtered List
  const filteredList = resourcesList.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.resourceId.toLowerCase().includes(search.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const matchesType = typeFilter === "all" || r.type === typeFilter;
    const matchesDistrict =
      !districtFilter || r.district.toLowerCase().includes(districtFilter.toLowerCase()) || r.managedByDistrict.toLowerCase().includes(districtFilter.toLowerCase());
    const matchesState =
      !stateFilter || r.state.toLowerCase().includes(stateFilter.toLowerCase()) || r.managedByState.toLowerCase().includes(stateFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesType && matchesDistrict && matchesState;
  });

  return (
    <AppShell
      title="Global Stockpile Inventory"
      actions={
        <Button onClick={() => setIsCreateOpen(true)} className="rounded-full shadow-glow gap-1 text-xs">
          <Plus className="h-4 w-4" /> Register Global Asset
        </Button>
      }
    >
      <p className="text-muted-foreground -mt-1 mb-6">
        Platform-wide stockpile tracking, jurisdiction overrides, deployment audit trails, and command center transfers.
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase font-medium">
                Total Assets
              </div>
              <div className="text-xl font-bold">{totalCount}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase font-medium">
                Available
              </div>
              <div className="text-xl font-bold text-success">{availableCount}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-info/10 text-info flex items-center justify-center shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase font-medium">
                Deployed / In Use
              </div>
              <div className="text-xl font-bold text-info">{assignedCount}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center shrink-0">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase font-medium">
                Maintenance
              </div>
              <div className="text-xl font-bold text-warning">{maintenanceCount}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm col-span-2 lg:col-span-1">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emergency/10 text-emergency flex items-center justify-center shrink-0">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase font-medium">
                Unavailable
              </div>
              <div className="text-xl font-bold text-emergency">{unavailableCount}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Card */}
      <Card className="border-border/60 mb-6 bg-muted/20">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assets by code, name, or description..."
              className="pl-9 bg-background border-border/50 text-xs h-8"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center justify-end w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 rounded-full border px-3 text-xs bg-background text-foreground"
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
              className="h-8 rounded-full border px-3 text-xs bg-background text-foreground"
            >
              <option value="all">All Types</option>
              {RESOURCE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <Input
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              placeholder="Filter District..."
              className="h-8 w-32 rounded-full border px-3 text-xs bg-background"
            />

            <Input
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              placeholder="Filter State..."
              className="h-8 w-32 rounded-full border px-3 text-xs bg-background"
            />

            {(search ||
              statusFilter !== "all" ||
              typeFilter !== "all" ||
              districtFilter ||
              stateFilter) && (
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
          <div className="animate-pulse text-muted-foreground text-sm font-medium">
            Syncing global inventories...
          </div>
        </div>
      ) : filteredList.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="p-8 text-center flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-muted grid place-items-center mb-4 text-muted-foreground">
              <Boxes className="h-6 w-6" />
            </div>
            <div className="font-semibold text-lg">No assets registered</div>
            <p className="text-muted-foreground text-sm mt-1 max-w-sm">
              No global assets found matching current filter parameters.
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
                  <th className="p-4">Operational Location</th>
                  <th className="p-4">Managing Center</th>
                  <th className="p-4">Deployments</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredList.map((res) => (
                  <tr key={res._id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-mono text-xs font-semibold text-primary">
                      {res.resourceId}
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-foreground">{res.name}</div>
                        {res.description && (
                          <div className="text-xs text-muted-foreground truncate max-w-xs">
                            {res.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary" className="rounded-md px-1.5 py-0.5 text-xs font-normal">
                        {res.type}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 items-start">
                        <Badge
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-medium border capitalize",
                            res.status === "Available"
                              ? "bg-success/15 text-success border-success/20"
                              : res.status === "In Use"
                                ? "bg-emergency/15 text-emergency border-emergency/25"
                                : res.status === "Assigned"
                                  ? "bg-info/15 text-info border-info/25"
                                  : res.status === "Maintenance"
                                    ? "bg-warning/15 text-warning border-warning/20"
                                    : "bg-muted text-muted-foreground border-border",
                          )}
                        >
                          {res.status}
                        </Badge>
                        {res.assignedIncident && (
                          <span className="text-[10px] text-primary truncate max-w-[120px]" title={`Incident Code: ${res.assignedIncident.incidentNumber}`}>
                            Inc: {res.assignedIncident.incidentNumber || "Assigned"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs">
                        <span className="font-medium text-foreground">{res.district}</span>
                        <span className="text-muted-foreground block text-[10px]">{res.state}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs">
                        <span className="font-medium text-foreground">{res.managedByDistrict}</span>
                        <span className="text-muted-foreground block text-[10px]">{res.managedByState}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          {res.totalAssignments}
                        </span>{" "}
                        deployments
                        {res.totalUsageHours > 0 && (
                          <span className="block text-[10px]">
                            ({res.totalUsageHours} hrs total)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full"
                          onClick={() => openStatus(res)}
                          title="Update/Override Status"
                        >
                          <Check className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full"
                          onClick={() => openTransfer(res)}
                          title="Transfer Jurisdiction"
                        >
                          <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full"
                          onClick={() => openHistory(res)}
                          title="Audit History Logs"
                        >
                          <History className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                        {res.assignedIncident && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-full text-warning hover:bg-warning/5"
                            onClick={() => handleRelease(res)}
                            title="Override & Release Assignment"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full"
                          onClick={() => openEdit(res)}
                          title="Edit Info"
                        >
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full text-emergency hover:bg-emergency/5"
                          onClick={() => handleDelete(res._id)}
                          title="Delete Asset"
                        >
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

      {/* REGISTER NEW ASSET DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md rounded-2xl border shadow-elegant">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle className="font-bold text-base flex items-center gap-1.5">
                <Boxes className="h-5 w-5 text-primary" /> Register Global Stockpile Asset
              </DialogTitle>
              <DialogDescription className="text-xs">
                Register a new incident response asset into the platform database.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Asset Name</Label>
                <Input
                  required
                  placeholder="e.g. Life raft 4-person capacity"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Asset Category</Label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full h-9 rounded-md border border-input px-3 bg-background text-xs"
                  >
                    {RESOURCE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">District Location</Label>
                  <Input
                    required
                    placeholder="Mumbai"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">State Location</Label>
                  <Input
                    required
                    placeholder="Maharashtra"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Managing Command Center</Label>
                  <div className="text-[10px] text-muted-foreground mt-2 italic">
                    Defaults to operational location.
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Asset Description & Specs</Label>
                <Textarea
                  placeholder="Capacity, model, battery levels, calibration dates..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="border-t pt-3">
              <Button type="button" variant="ghost" className="rounded-full" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-full shadow-glow">
                Register Stockpile
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT SPECIFICATIONS DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md rounded-2xl border shadow-elegant">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle className="font-bold text-base">Modify Specifications</DialogTitle>
              <DialogDescription className="text-xs">
                Edit registered values for asset {selectedResource?.resourceId}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Asset Name</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Asset Category</Label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full h-9 rounded-md border border-input px-3 bg-background text-xs"
                  >
                    {RESOURCE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">District Location</Label>
                  <Input
                    required
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">State Location</Label>
                  <Input
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Managing District</Label>
                  <Input
                    required
                    value={formData.managedByDistrict}
                    onChange={(e) => setFormData({ ...formData, managedByDistrict: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Managing State</Label>
                  <Input
                    required
                    value={formData.managedByState}
                    onChange={(e) => setFormData({ ...formData, managedByState: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Asset Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="border-t pt-3">
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

      {/* UPDATE STATUS DIALOG */}
      <Dialog open={isStatusOpen} onOpenChange={setIsStatusOpen}>
        <DialogContent className="max-w-md rounded-2xl border shadow-elegant">
          <form onSubmit={handleStatusSubmit}>
            <DialogHeader>
              <DialogTitle className="font-bold text-base flex items-center gap-1">
                <Check className="h-5 w-5 text-primary" /> Override Operational Status
              </DialogTitle>
              <DialogDescription className="text-xs">
                Directly override the operational status of {selectedResource?.resourceId}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Select Target Status</Label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full h-9 rounded-md border border-input px-3 bg-background text-xs"
                >
                  <option value="Available">Available (Unassigned)</option>
                  <option value="Assigned">Assigned (Operational)</option>
                  <option value="In Use">In Use (Field ops active)</option>
                  <option value="Maintenance">Maintenance (Under repair)</option>
                  <option value="Unavailable">Unavailable (Offline)</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Status Update Notes / Justification</Label>
                <Textarea
                  required
                  placeholder="Provide detailed description of change, reason for audit override, etc."
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="border-t pt-3">
              <Button type="button" variant="ghost" className="rounded-full" onClick={() => setIsStatusOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-full shadow-glow">
                Apply Status
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* TRANSFER JURISDICTION DIALOG */}
      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent className="max-w-md rounded-2xl border shadow-elegant">
          <form onSubmit={handleTransferSubmit}>
            <DialogHeader>
              <DialogTitle className="font-bold text-base flex items-center gap-1.5">
                <ArrowRightLeft className="h-5 w-5 text-primary" /> Transfer Jurisdiction & Stockpile
              </DialogTitle>
              <DialogDescription className="text-xs">
                Move asset {selectedResource?.resourceId} to a different district or state.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Target District Location</Label>
                  <Input
                    required
                    placeholder="e.g. Pune"
                    value={transferData.district}
                    onChange={(e) => setTransferData({ ...transferData, district: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Target State Location</Label>
                  <Input
                    required
                    placeholder="e.g. Maharashtra"
                    value={transferData.state}
                    onChange={(e) => setTransferData({ ...transferData, state: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 py-1">
                <input
                  type="checkbox"
                  id="sameAsManaging"
                  checked={transferData.sameAsManaging}
                  onChange={(e) => setTransferData({ ...transferData, sameAsManaging: e.target.checked })}
                  className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                />
                <Label htmlFor="sameAsManaging" className="text-[11px] font-semibold cursor-pointer">
                  Align managing command center with new location
                </Label>
              </div>

              {!transferData.sameAsManaging && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-muted/20 border rounded-xl">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">Managing District</Label>
                    <Input
                      required
                      placeholder="e.g. Mumbai"
                      value={transferData.managedByDistrict}
                      onChange={(e) => setTransferData({ ...transferData, managedByDistrict: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">Managing State</Label>
                    <Input
                      required
                      placeholder="e.g. Maharashtra"
                      value={transferData.managedByState}
                      onChange={(e) => setTransferData({ ...transferData, managedByState: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="border-t pt-3">
              <Button type="button" variant="ghost" className="rounded-full" onClick={() => setIsTransferOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-full shadow-glow">
                Authorize Transfer
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
              Audit trail and utilization metrics for stockpile asset {selectedResource?.resourceId}{" "}
              ({selectedResource?.name}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-3 bg-muted/30 border p-3 rounded-xl">
              <div className="text-center">
                <div className="text-[10px] text-muted-foreground uppercase font-medium">
                  Deployments
                </div>
                <div className="text-lg font-bold text-foreground">
                  {selectedResource?.totalAssignments || 0}
                </div>
              </div>
              <div className="text-center border-x">
                <div className="text-[10px] text-muted-foreground uppercase font-medium">
                  Usage Hours
                </div>
                <div className="text-lg font-bold text-foreground">
                  {selectedResource?.totalUsageHours || 0} hrs
                </div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-muted-foreground uppercase font-medium">
                  Last Used
                </div>
                <div className="text-xs font-semibold text-foreground truncate mt-1">
                  {selectedResource?.lastUsedAt
                    ? new Date(selectedResource.lastUsedAt).toLocaleDateString()
                    : "Never"}
                </div>
              </div>
            </div>

            {/* Deployment Incident History */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Deployment History
              </h4>
              {!selectedResource?.assignmentHistory ||
              selectedResource.assignmentHistory.length === 0 ? (
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
                          <td className="p-2 text-muted-foreground">
                            {new Date(h.assignedAt).toLocaleString()}
                          </td>
                          <td className="p-2 text-muted-foreground">
                            {h.releasedAt ? (
                              new Date(h.releasedAt).toLocaleString()
                            ) : (
                              <Badge
                                variant="secondary"
                                className="bg-info/10 text-info text-[9px] px-1 py-0 border-info/20 animate-pulse"
                              >
                                Active
                              </Badge>
                            )}
                          </td>
                          <td className="p-2 text-muted-foreground capitalize">
                            {h.assignedByRole}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Audit Logs */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Audit activity logs
              </h4>
              {!selectedResource?.resourceActivityLog ||
              selectedResource.resourceActivityLog.length === 0 ? (
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
                          <span className="font-semibold text-xs text-foreground">
                            {log.action}
                          </span>
                          <span className="text-[9px] text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          By:{" "}
                          <span className="font-medium text-foreground">{log.performedByRole}</span>
                        </div>
                        {log.notes && (
                          <p className="text-[11px] mt-0.5 text-muted-foreground italic bg-muted/10 p-1.5 border rounded-md">
                            {log.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="border-t pt-3">
            <Button
              variant="outline"
              onClick={() => setIsHistoryOpen(false)}
              className="rounded-full"
            >
              Close Inspection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
