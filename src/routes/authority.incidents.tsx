import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SeverityBadge, StatusBadge, typeIcon, typeColor, mapCategoryToKey } from "@/components/shared";
import { getStatusBadgeTone } from "@/lib/constants/incident-status";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { incidentService } from "@/services/incidentService";
import { IncidentDetailsDialog } from "@/components/incident-details-dialog";
import { Search, MapPin, Calendar, Eye, Filter, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/authority/incidents")({
  head: () => ({ meta: [{ title: "Incident Command — ResQNet" }] }),
  component: AuthorityIncidentsPage,
});

function AuthorityIncidentsPage() {
  const [incidentsList, setIncidentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Filtering states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const loadIncidents = () => {
    setLoading(true);
    // Fetch all incidents
    incidentService
      .getIncidents()
      .then((data) => {
        setIncidentsList(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading incidents:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleInspect = (inc: any) => {
    setSelectedIncident(inc);
    setDialogOpen(true);
  };

  // Filter list locally for search responsiveness
  const filteredList = incidentsList.filter((i) => {
    const matchesSearch =
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.incidentNumber.toLowerCase().includes(search.toLowerCase()) ||
      (i.address && i.address.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "all" || i.status === statusFilter;
    const matchesSeverity = severityFilter === "all" || i.severity.toLowerCase() === severityFilter.toLowerCase();
    const matchesCategory = categoryFilter === "all" || i.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesSeverity && matchesCategory;
  });

  return (
    <AppShell title="Incident command center">
      <p className="text-muted-foreground -mt-1 mb-6">
        Assess reported emergencies, dispatch rescue responders, and coordinate auxiliary volunteers.
      </p>

      {/* Search & Filters */}
      <Card className="border-border/60 mb-6 shadow-elegant">
        <CardContent className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by incident number, title, or landmark..."
              className="pl-9 h-11 bg-muted/40 border-0 focus-visible:ring-1"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Filter className="h-3.5 w-3.5" /> Filters:
            </div>
            
            {/* Status Selector */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 rounded-full border bg-background px-3 text-xs focus:ring-1"
            >
              <option value="all">All Statuses</option>
              <option value="Reported">Reported</option>
              <option value="Verified">Verified</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            {/* Severity Selector */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="h-8 rounded-full border bg-background px-3 text-xs focus:ring-1"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Category Selector */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-8 rounded-full border bg-background px-3 text-xs focus:ring-1"
            >
              <option value="all">All Categories</option>
              <option value="Flood">Flood</option>
              <option value="Fire">Fire</option>
              <option value="Medical Emergency">Medical Emergency</option>
              <option value="Cyclone">Cyclone</option>
              <option value="Earthquake">Earthquake</option>
              <option value="Landslide">Landslide</option>
              <option value="Other">Other</option>
            </select>

            {filteredList.length !== incidentsList.length && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setSeverityFilter("all");
                  setCategoryFilter("all");
                }}
                className="h-8 text-xs rounded-full px-3 text-muted-foreground hover:text-foreground"
              >
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Incidents Table / List */}
      {loading ? (
        <div className="flex h-[300px] items-center justify-center">
          <div className="animate-pulse text-muted-foreground text-sm font-medium">Loading command stream...</div>
        </div>
      ) : filteredList.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="p-8 text-center flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-muted grid place-items-center mb-4 text-muted-foreground">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="font-semibold text-lg">No matching incidents</div>
            <p className="text-muted-foreground text-sm mt-1 max-w-sm">
              We couldn't find any incident tickets matching the active search or filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredList.map((inc) => {
            const catKey = mapCategoryToKey(inc.category);
            const Icon = typeIcon[catKey] || ShieldAlert;
            return (
              <Card
                key={inc._id}
                className="overflow-hidden border-border/60 hover:shadow-elegant transition cursor-pointer"
                onClick={() => handleInspect(inc)}
              >
                <CardContent className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start md:items-center gap-3 min-w-0">
                    <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5 md:mt-0", typeColor[catKey] || "bg-primary/10 text-primary")}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-muted-foreground font-semibold">
                          {inc.incidentNumber}
                        </span>
                        <span className="font-semibold text-sm truncate">{inc.title}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-1 items-center">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {inc.address || `${inc.district}, ${inc.state}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" /> {new Date(inc.createdAt).toLocaleDateString()}
                        </span>
                        {inc.assignedRescueTeam && (
                          <span className="text-primary font-medium">
                            Assigned: {inc.assignedRescueTeam.name}
                          </span>
                        )}
                        {inc.assignedVolunteers.length > 0 && (
                          <span className="text-success font-medium">
                            Volunteers: {inc.assignedVolunteers.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                    <SeverityBadge severity={inc.severity} />
                    <Badge className={cn("rounded-full px-2.5 py-0.5 text-xs capitalize", getStatusBadgeTone(inc.status))}>
                      {inc.status}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selectedIncident && (
        <IncidentDetailsDialog
          incident={selectedIncident}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onUpdate={loadIncidents}
        />
      )}
    </AppShell>
  );
}
