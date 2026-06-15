import { createFileRoute } from "@tanstack/react-router";
import { FeaturePage, PillBadge } from "@/components/feature-page";
import { Activity, AlertTriangle, Radio, Eye, Globe2 } from "lucide-react";
import { useState, useEffect } from "react";
import { mapService } from "@/services/mapService";
import { Incident, Shelter } from "@/lib/mock-data";
import { Map } from "@/components/map/map";
import { MapProvider } from "@/components/map/map-provider";
import { MapMarker } from "@/components/map/types";
import { Card } from "@/components/ui/card";
import { SeverityBadge, StatusBadge, typeIcon, typeColor } from "@/components/shared";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/authority/monitoring")({
  head: () => ({ meta: [{ title: "Live Monitoring — ResQNet" }] }),
  component: AuthorityMonitoringWrapper,
});

function AuthorityMonitoringWrapper() {
  return (
    <MapProvider>
      <AuthorityMonitoring />
    </MapProvider>
  );
}

function AuthorityMonitoring() {
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);

  useEffect(() => {
    mapService.getIncidents().then(setIncidents);
    mapService.getShelters().then(setShelters);
  }, []);

  // Build uniform MapMarkers for Leaflet Map
  const incidentMarkers: MapMarker[] = incidents.map((i) => ({
    id: i.id,
    position: i.coordinates,
    type: "incident",
    title: i.title,
    subtitle: `${i.caseId} · ${i.location}`,
    severity: i.severity,
    status: i.status,
  }));

  const shelterMarkers: MapMarker[] = shelters.map((s) => ({
    id: s.id,
    position: s.coordinates,
    type: "shelter",
    title: s.name,
    subtitle: `${s.address} · ${s.occupied}/${s.capacity} beds`,
    status: s.status,
  }));

  const markers = [...incidentMarkers, ...shelterMarkers];

  const columns = [
    { key: "caseId", label: "Case", render: (r: Incident) => <span className="font-mono text-xs">{r.caseId}</span> },
    {
      key: "type",
      label: "Type",
      render: (r: Incident) => {
        const Icon = typeIcon[r.type] || AlertTriangle;
        return (
          <span className="inline-flex items-center gap-2">
            <span className={cn("h-7 w-7 rounded-lg grid place-items-center shrink-0", typeColor[r.type])}>
              <Icon className="h-3.5 w-3.5" />
            </span>
            <span className="capitalize text-sm">{r.type}</span>
          </span>
        );
      },
    },
    { key: "city", label: "Region" },
    { key: "affectedPeople", label: "Affected", render: (r: Incident) => <span className="text-sm">{r.affectedPeople}</span> },
    { key: "severity", label: "Severity", render: (r: Incident) => <SeverityBadge severity={r.severity} /> },
    { key: "status", label: "Status", render: (r: Incident) => <StatusBadge status={r.status} /> },
  ];

  return (
    <FeaturePage
      title="Live monitoring"
      subtitle="National incident stream, sensor feeds, and broadcast controls."
      stats={[
        { label: "Live incidents", value: incidents.length.toString(), sublabel: `${incidents.filter((i) => i.severity === "critical").length} critical`, icon: AlertTriangle, accent: "emergency" },
        { label: "Sensor feeds", value: "1,284", sublabel: "98% online", icon: Activity, accent: "success" },
        { label: "Broadcasts today", value: "9", sublabel: "3 active", icon: Radio, accent: "warning" },
        { label: "Eyes on map", value: "182", sublabel: "all roles", icon: Eye, accent: "info" },
      ]}
      extraActions={[
        {
          label: viewMode === "map" ? "View stream" : "View map",
          icon: viewMode === "map" ? Activity : Globe2,
          onClick: () => setViewMode((v) => (v === "map" ? "list" : "map")),
        },
        { label: "Issue broadcast", icon: Radio },
      ]}
      tableTitle="National stream"
      filters={["All", "Critical", "Coastal", "Northern", "Southern", "Last 1h"]}
      tableCols={viewMode === "list" ? columns : undefined}
      tableRows={viewMode === "list" ? incidents.slice(0, 18) : undefined}
      sideCards={[
        {
          title: "Active broadcasts",
          items: [
            { label: "Cyclone watch · Tamil Nadu", value: <PillBadge tone="warning">Live</PillBadge> },
            { label: "Flood advisory · Maharashtra", value: <PillBadge tone="warning">Live</PillBadge> },
            { label: "Heat warning · Rajasthan", value: <PillBadge tone="warning">Live</PillBadge> },
          ],
        },
        {
          title: "Sensor status",
          items: [
            { label: "Coastal tide gauges", value: <PillBadge tone="success">412 / 420</PillBadge> },
            { label: "Seismic stations", value: <PillBadge tone="success">288 / 290</PillBadge> },
            { label: "Air quality", value: <PillBadge tone="warning">580 / 612</PillBadge> },
          ],
        },
      ]}
    >
      {viewMode === "map" && (
        <Card className="shadow-elegant border-border/60 overflow-hidden h-[520px] relative w-full mb-6">
          <Map markers={markers} className="h-full w-full" />
        </Card>
      )}
    </FeaturePage>
  );
}
