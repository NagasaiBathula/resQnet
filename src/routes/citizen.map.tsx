import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionTitle, typeIcon, typeColor, SeverityBadge } from "@/components/shared";
import { MapPin, Search, Locate, ShieldAlert, Building2, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Map } from "@/components/map/map";
import { MapProvider, useMapController } from "@/components/map/map-provider";
import { mapService } from "@/services/mapService";
import { incidentService } from "@/services/incidentService";
import { resourceService } from "@/services/resourceService";
import { Shelter } from "@/lib/mock-data";
import { MapMarker } from "@/components/map/types";
import { Coordinate, DEFAULT_CENTER, DEFAULT_ZOOM } from "@/lib/constants/map-defaults";

export const Route = createFileRoute("/citizen/map")({
  head: () => ({ meta: [{ title: "Emergency Map — ResQNet" }] }),
  component: MapViewWrapper,
});

function MapViewWrapper() {
  return (
    <MapProvider>
      <MapView />
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

function MapView() {
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [incidents, setIncidents] = useState<any[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const controller = useMapController();

  useEffect(() => {
    // Retrieve incidents from real MongoDB incidentService
    incidentService.getIncidents().then(setIncidents).catch(err => console.error(err));
    // Retrieve resources
    resourceService.getResources().then(setResources).catch(err => console.error(err));
    // Shelters remain mock data in this phase
    mapService.getShelters().then(setShelters);
  }, []);

  // Build uniform MapMarker items
  const incidentMarkers: MapMarker[] = incidents.map((inc) => ({
    id: inc._id,
    position: inc.coordinates,
    type: "incident",
    title: inc.title,
    subtitle: `${inc.incidentNumber} · ${inc.address || `${inc.district}, ${inc.state}`}`,
    severity: inc.severity.toLowerCase() as any,
    status: inc.status,
  }));

  const shelterMarkers: MapMarker[] = shelters.map((s) => ({
    id: s.id,
    position: s.coordinates,
    type: "shelter",
    title: s.name,
    subtitle: `${s.address} · ${s.occupied}/${s.capacity} beds occupied`,
    status: s.status,
  }));

  const resourceMarkers: MapMarker[] = resources
    .filter(res => (res.status === "Assigned" || res.status === "In Use") && res.assignedIncident)
    .map(res => {
      const incId = res.assignedIncident?._id || res.assignedIncident;
      const inc = incidents.find(i => i._id === incId);
      if (!inc) return null;
      return {
        id: res._id,
        position: {
          lat: inc.coordinates.lat + 0.0003,
          lng: inc.coordinates.lng - 0.0003,
        },
        type: "resource" as any,
        title: `${res.name} (${res.resourceId})`,
        subtitle: `Deployed at ${inc.incidentNumber} · Status: ${res.status}`,
        status: res.status,
      };
    })
    .filter(Boolean) as MapMarker[];

  const allMarkers = [...incidentMarkers, ...shelterMarkers, ...resourceMarkers];

  // Geolocation Handler
  const handleMyLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc: Coordinate = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          controller.setUserLocation(loc);
          controller.panTo(loc, 13);
          setIsLocating(false);
        },
        (error) => {
          console.error("Error retrieving geolocation", error);
          const fallback: Coordinate = DEFAULT_CENTER;
          controller.setUserLocation(fallback);
          controller.panTo(fallback, 13);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  // Filter & Search Logic
  const filteredMarkers = allMarkers.filter((marker) => {
    const matchesSearch =
      marker.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (marker.subtitle && marker.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filter === "all") return true;
    if (filter === "shelter") return marker.type === "shelter";
    if (filter === "resource") return marker.type === "resource";

    if (marker.type === "incident") {
      const originalIncident = incidents.find((i) => i._id === marker.id);
      if (!originalIncident) return false;
      const key = mapCategoryToKey(originalIncident.category);
      return key === filter;
    }

    return false;
  });

  const visibleIncidentsList = incidents.filter((i) => {
    const matchesSearch =
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.address && i.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      i.incidentNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const key = mapCategoryToKey(i.category);
    const matchesFilter = filter === "all" || filter === key;
    return matchesSearch && matchesFilter;
  });

  const visibleSheltersList = shelters.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || filter === "shelter";
    return matchesSearch && matchesFilter;
  });

  return (
    <AppShell
      title="Emergency map"
      actions={
        <Button
          onClick={handleMyLocation}
          disabled={isLocating}
          className="rounded-full shadow-glow"
        >
          <Locate className={cn("h-4 w-4 mr-1.5", isLocating && "animate-spin")} />
          {isLocating ? "Locating..." : "My location"}
        </Button>
      }
    >
      <p className="text-muted-foreground -mt-1 mb-6">
        Live incidents, shelters, and active stockpile resources in your region.
      </p>
      
      <div className="grid lg:grid-cols-[1fr_360px] gap-4">
        {/* Interactive OSM Map Container */}
        <Card className="overflow-hidden shadow-elegant h-[520px] relative border-border/60">
          <Map
            markers={filteredMarkers}
            showUserLocation={true}
            className="h-full w-full"
            onMarkerClick={(marker) => {
              controller.panTo(marker.position, Math.max(controller.zoom, 12));
            }}
          />
        </Card>

        {/* Sidebar Controls and Lists */}
        <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search location or title…"
                  className="pl-9 h-10 bg-muted/40 border-0 focus-visible:ring-1"
                />
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {["all", "flood", "fire", "medical", "cyclone", "shelter", "resource"].map((f) => (
                  <Badge
                    key={f}
                    variant="outline"
                    onClick={() => setFilter(f)}
                    className={cn(
                      "rounded-full cursor-pointer capitalize text-xs px-2.5 py-0.5 transition",
                      filter === f
                        ? "bg-primary/10 text-primary border-primary/30 font-medium"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {f}
                  </Badge>
                ))}
              </div>

              {/* Nearby Incidents List */}
              {visibleIncidentsList.length > 0 && (
                <div className="mb-4">
                  <SectionTitle title="Nearby incidents" />
                  <ul className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                    {visibleIncidentsList.slice(0, 10).map((i) => {
                      const key = mapCategoryToKey(i.category);
                      const Icon = typeIcon[key] || ShieldAlert;
                      return (
                        <li
                          key={i._id}
                          onClick={() => controller.panTo(i.coordinates, 14)}
                          className="flex items-center gap-3 rounded-xl border p-2 cursor-pointer transition hover:bg-accent/40"
                        >
                          <div className={cn("h-8 w-8 rounded-lg grid place-items-center shrink-0", typeColor[key] || "bg-primary/10 text-primary")}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold truncate">{i.title}</div>
                            <div className="text-[10px] text-muted-foreground truncate">
                              <MapPin className="h-3 w-3 inline mr-0.5" />
                              {i.address || `${i.district}, ${i.state}`}
                            </div>
                          </div>
                          <SeverityBadge severity={i.severity} />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Nearby Shelters List */}
              {visibleSheltersList.length > 0 && (
                <div>
                  <SectionTitle title="Nearby shelters" />
                  <ul className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
                    {visibleSheltersList.slice(0, 10).map((s) => (
                      <li
                        key={s.id}
                        onClick={() => controller.panTo(s.coordinates, 14)}
                        className="flex items-center justify-between gap-2 text-xs rounded-xl border p-2 cursor-pointer transition hover:bg-accent/40"
                      >
                        <span className="truncate font-medium flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-success shrink-0" />
                          {s.name}
                        </span>
                        <Badge variant="outline" className="rounded-full shrink-0 text-[10px] scale-90">
                          {s.distanceKm} km
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
