import { createFileRoute } from "@tanstack/react-router";
import { FeaturePage, PillBadge } from "@/components/feature-page";
import { Activity, AlertTriangle, Radio, Eye, Globe2 } from "lucide-react";
import { useState, useEffect } from "react";
import { mapService } from "@/services/mapService";
import { incidentService } from "@/services/incidentService";
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

const mapCategoryToKey = (category: string) => {
  const c = category?.toLowerCase() || "";
  if (c.includes("medical")) return "medical";
  if (c.includes("flood")) return "flood";
  if (c.includes("fire")) return "fire";
  if (c.includes("cyclone")) return "cyclone";
  if (c.includes("earthquake")) return "earthquake";
  if (c.includes("landslide")) return "landslide";
  return "medical"; // fallback
};

function AuthorityMonitoring() {
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [incidents, setIncidents] = useState<any[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);

  const loadData = () => {
    incidentService
      .getIncidents()
      .then(setIncidents)
      .catch((err) => console.error(err));
    mapService.getShelters().then(setShelters);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Build uniform MapMarkers for Leaflet Map
  const incidentMarkers: MapMarker[] = incidents.map((i) => ({
    id: i._id,
    position: i.coordinates,
    type: "incident",
    title: i.title,
    subtitle: `${i.incidentNumber} · ${i.address || `${i.district}, ${i.state}`}`,
    severity: i.severity.toLowerCase() as any,
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
    {
      key: "incidentNumber",
      label: "Case",
      render: (r: any) => <span className="font-mono text-xs font-bold">{r.incidentNumber}</span>,
    },
    {
      key: "category",
      label: "Type",
      render: (r: any) => {
        const Icon = typeIcon[mapCategoryToKey(r.category)] || AlertTriangle;
        const key = mapCategoryToKey(r.category);
        return (
          <span className="inline-flex items-center gap-2">
            <span
              className={cn(
                "h-7 w-7 rounded-lg grid place-items-center shrink-0",
                typeColor[key] || "bg-primary/10 text-primary",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            <span className="capitalize text-sm">{r.category}</span>
          </span>
        );
      },
    },
    {
      key: "district",
      label: "Region",
      render: (r: any) => (
        <span className="text-sm">
          {r.district}, {r.state}
        </span>
      ),
    },
    {
      key: "affectedPeople",
      label: "Description",
      render: (r: any) => <span className="text-xs truncate max-w-xs block">{r.description}</span>,
    },
    {
      key: "severity",
      label: "Severity",
      render: (r: any) => <SeverityBadge severity={r.severity} />,
    },
    { key: "status", label: "Status", render: (r: any) => <StatusBadge status={r.status} /> },
  ];

  return (
    <FeaturePage
      title="Live monitoring"
      subtitle="National incident stream, sensor feeds, and broadcast controls."
      stats={[
        {
          label: "Live incidents",
          value: incidents.length.toString(),
          sublabel: `${incidents.filter((i) => i.severity.toLowerCase() === "critical").length} critical`,
          icon: AlertTriangle,
          accent: "emergency",
        },
        {
          label: "Sensor feeds",
          value: "1,284",
          sublabel: "98% online",
          icon: Activity,
          accent: "success",
        },
        {
          label: "Broadcasts today",
          value: "9",
          sublabel: "3 active",
          icon: Radio,
          accent: "warning",
        },
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
            {
              label: "Cyclone watch · Tamil Nadu",
              value: <PillBadge tone="warning">Live</PillBadge>,
            },
            {
              label: "Flood advisory · Maharashtra",
              value: <PillBadge tone="warning">Live</PillBadge>,
            },
            {
              label: "Heat warning · Rajasthan",
              value: <PillBadge tone="warning">Live</PillBadge>,
            },
          ],
        },
        {
          title: "Sensor status",
          items: [
            {
              label: "Coastal tide gauges",
              value: <PillBadge tone="success">412 / 420</PillBadge>,
            },
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
