import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { typeIcon, typeColor, SeverityBadge, mapCategoryToKey } from "@/components/shared";
import { getStatusBadgeTone } from "@/lib/constants/incident-status";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { incidentService } from "@/services/incidentService";
import { IncidentDetailsDialog } from "@/components/incident-details-dialog";
import { MapPin, Calendar, Eye, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/citizen/incidents")({
  head: () => ({ meta: [{ title: "My Incidents — ResQNet" }] }),
  component: CitizenIncidentsPage,
});

function CitizenIncidentsPage() {
  const [incidentsList, setIncidentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchIncidents = () => {
    setLoading(true);
    incidentService
      .getMyIncidents()
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
    fetchIncidents();
  }, []);

  const handleInspect = (inc: any) => {
    setSelectedIncident(inc);
    setDialogOpen(true);
  };

  return (
    <AppShell title="My reported incidents">
      <p className="text-muted-foreground -mt-1 mb-6">
        Track active emergency reports and response statuses.
      </p>

      {loading ? (
        <div className="flex h-[300px] items-center justify-center">
          <div className="animate-pulse text-muted-foreground text-sm font-medium">
            Loading reports...
          </div>
        </div>
      ) : incidentsList.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="p-8 text-center flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-muted grid place-items-center mb-4 text-muted-foreground">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="font-semibold text-lg">No incidents filed</div>
            <p className="text-muted-foreground text-sm mt-1 max-w-sm">
              You haven't reported any emergency incidents yet. Click "Report emergency" if you
              observe a disaster scenario.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {incidentsList.map((inc) => {
            const catKey = mapCategoryToKey(inc.category);
            const Icon = typeIcon[catKey] || ShieldAlert;
            return (
              <Card
                key={inc._id}
                className="overflow-hidden border-border/60 hover:shadow-elegant transition cursor-pointer"
                onClick={() => handleInspect(inc)}
              >
                <CardContent className="p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "h-11 w-11 rounded-xl flex items-center justify-center shrink-0",
                        typeColor[catKey] || "bg-primary/10 text-primary",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-muted-foreground font-semibold">
                          {inc.incidentNumber}
                        </span>
                        <span className="font-semibold text-sm truncate">{inc.title}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1 items-center">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />{" "}
                          {inc.address || `${inc.district}, ${inc.state}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />{" "}
                          {new Date(inc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                    <SeverityBadge severity={inc.severity} />
                    <Badge
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs capitalize",
                        getStatusBadgeTone(inc.status),
                      )}
                    >
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
          onUpdate={fetchIncidents}
        />
      )}
    </AppShell>
  );
}
