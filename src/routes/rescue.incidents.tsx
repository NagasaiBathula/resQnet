import { createFileRoute } from "@tanstack/react-router";
import { FeaturePage, PillBadge } from "@/components/feature-page";
import { AlertTriangle, Truck, Clock, Users, ShieldAlert, Radio, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { incidentService } from "@/services/incidentService";
import { IncidentDetailsDialog } from "@/components/incident-details-dialog";
import { SeverityBadge, StatusBadge, typeIcon, typeColor, mapCategoryToKey } from "@/components/shared";
import { getStatusBadgeTone } from "@/lib/constants/incident-status";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/rescue/incidents")({
  head: () => ({ meta: [{ title: "Assigned Incidents — ResQNet" }] }),
  component: RescueIncidentsPage,
});

function RescueIncidentsPage() {
  const [incidentsList, setIncidentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchMyIncidents = () => {
    setLoading(true);
    incidentService
      .getMyIncidents()
      .then((data) => {
        setIncidentsList(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading assigned incidents:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMyIncidents();
  }, []);

  const handleInspect = (inc: any) => {
    setSelectedIncident(inc);
    setDialogOpen(true);
  };

  // Stats computation
  const activeCount = incidentsList.filter(
    (i) => i.status === "Assigned" || i.status === "In Progress"
  ).length;
  const criticalCount = incidentsList.filter(
    (i) => (i.severity === "critical" || i.severity === "High" || i.severity === "Critical") && i.status !== "Resolved"
  ).length;
  const resolvedCount = incidentsList.filter((i) => i.status === "Resolved").length;

  const columns = [
    { key: "incidentNumber", label: "Case", render: (r: any) => <span className="font-mono text-xs font-bold">{r.incidentNumber}</span> },
    {
      key: "category",
      label: "Type",
      render: (r: any) => {
        const catKey = mapCategoryToKey(r.category);
        const Icon = typeIcon[catKey] || AlertTriangle;
        return (
          <span className="inline-flex items-center gap-2">
            <span className={cn("h-7 w-7 rounded-lg grid place-items-center shrink-0", typeColor[catKey] || "bg-primary/10 text-primary")}>
              <Icon className="h-3.5 w-3.5" />
            </span>
            <span className="capitalize text-sm">{r.category}</span>
          </span>
        );
      },
    },
    { key: "title", label: "Title", render: (r: any) => <span className="text-sm font-semibold">{r.title}</span> },
    { key: "location", label: "Region", render: (r: any) => <span className="text-xs text-muted-foreground">{r.district}, {r.state}</span> },
    { key: "severity", label: "Severity", render: (r: any) => <SeverityBadge severity={r.severity?.toLowerCase()} /> },
    { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
  ];

  return (
    <>
      <FeaturePage
        title="Active assignments"
        subtitle="Your response queue, deployment status, and on-ground resolutions."
        stats={[
          { label: "Active Tasks", value: activeCount.toString(), sublabel: "Response pending", icon: AlertTriangle, accent: "emergency" },
          { label: "Critical Incidents", value: criticalCount.toString(), sublabel: "Life-threatening", icon: Truck, accent: "primary" },
          { label: "Completed today", value: resolvedCount.toString(), sublabel: "Resolved cases", icon: Clock, accent: "success" },
          { label: "Assigned personnel", value: "8", sublabel: "Ready for deployment", icon: Users, accent: "info" },
        ]}
        extraActions={[{ label: "Open Channels", icon: Radio }]}
        tableTitle="My dispatch queue"
        filters={["All assignments", "Reported", "Verified", "Assigned", "In Progress", "Resolved"]}
        tableCols={columns}
        tableRows={incidentsList}
        progressTitle="Availability"
        progressRows={[
          { label: "Rescue Team Response", value: 100, max: 100, sub: "Nominal" },
          { label: "Equipment Loadout", value: 85, max: 100, sub: "85% capacity ready" },
        ]}
        sideCards={[
          {
            title: "Emergency SLA Info",
            items: [
              { label: "Triage response time", value: <PillBadge tone="success">Under 2m</PillBadge> },
              { label: "Evacuation route", value: <PillBadge tone="success">Clear</PillBadge> },
            ],
          },
        ]}
      >
        {/* Click intercept layer because FeaturePage renders a table body */}
        <div className="hidden">
          {incidentsList.map((inc) => (
            <div key={inc._id} onClick={() => handleInspect(inc)} />
          ))}
        </div>
      </FeaturePage>

      {/* Roster table intercept handler override */}
      {incidentsList.length > 0 && (
        <div className="max-w-7xl mx-auto -mt-16 px-4 pb-12">
          <Card className="border-border/60 shadow-elegant">
            <CardContent className="p-4 md:p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-semibold">
                Click on any case below to view details & update status:
              </div>
              <div className="space-y-2">
                {incidentsList.map((inc) => (
                  <div
                    key={inc._id}
                    onClick={() => handleInspect(inc)}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3.5 border rounded-xl hover:bg-accent/40 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="font-mono text-xs font-bold text-muted-foreground">{inc.incidentNumber}</div>
                      <div>
                        <div className="text-sm font-semibold">{inc.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{inc.address || `${inc.district}, ${inc.state}`}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={inc.severity} />
                      <Badge className={cn("rounded-full px-2 py-0.5 capitalize text-xs", getStatusBadgeTone(inc.status))}>
                        {inc.status}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedIncident && (
        <IncidentDetailsDialog
          incident={selectedIncident}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onUpdate={fetchMyIncidents}
        />
      )}
    </>
  );
}
