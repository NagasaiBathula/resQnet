import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { MapPin, Search, Phone, Navigation, Building2, Droplets, Wifi, BatteryCharging, Bed, Utensils, Cross } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Map } from "@/components/map/map";
import { MapProvider, useMapController } from "@/components/map/map-provider";
import { mapService } from "@/services/mapService";
import { Shelter } from "@/lib/mock-data";
import { MapMarker } from "@/components/map/types";

export const Route = createFileRoute("/citizen/shelters")({
  head: () => ({ meta: [{ title: "Shelter Locator — ResQNet" }] }),
  component: ShelterPageWrapper,
});

const FACILITY_ICON: Record<string, any> = {
  Water: Droplets,
  Food: Utensils,
  Medical: Cross,
  WiFi: Wifi,
  Power: BatteryCharging,
  Beds: Bed,
};

function ShelterPageWrapper() {
  return (
    <MapProvider>
      <ShelterPage />
    </MapProvider>
  );
}

function ShelterPage() {
  const [q, setQ] = useState("");
  const [sheltersList, setSheltersList] = useState<Shelter[]>([]);
  const [selected, setSelected] = useState<string>("");
  const controller = useMapController();

  useEffect(() => {
    // Fetch shelters from mapService
    mapService.getShelters().then((data) => {
      setSheltersList(data);
      if (data.length > 0) {
        setSelected(data[0].id);
      }
    });
  }, []);

  const filtered = sheltersList.filter(
    (s) =>
      s.name.toLowerCase().includes(q.toLowerCase()) ||
      s.city.toLowerCase().includes(q.toLowerCase())
  );

  const sel = sheltersList.find((s) => s.id === selected);

  // Sync selected shelter location with map center
  useEffect(() => {
    if (sel) {
      controller.panTo(sel.coordinates, 14);
    }
  }, [selected, sheltersList]);

  if (sheltersList.length === 0) {
    return (
      <AppShell title="Shelter locator">
        <div className="flex h-[400px] items-center justify-center">
          <div className="animate-pulse text-muted-foreground text-sm">Loading shelters...</div>
        </div>
      </AppShell>
    );
  }

  // Construct map markers for shelters
  const markers: MapMarker[] = sheltersList.map((s) => ({
    id: s.id,
    position: s.coordinates,
    type: "shelter",
    title: s.name,
    subtitle: `${s.occupied}/${s.capacity} occupied`,
    status: s.status,
  }));

  return (
    <AppShell title="Shelter locator">
      <p className="text-muted-foreground -mt-1 mb-6">
        {sheltersList.length} shelters across 10 cities · live capacity
      </p>
      
      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-4 h-[calc(100vh-200px)] min-h-[600px]">
        {/* List */}
        <div className="flex flex-col gap-3 min-h-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search shelters or cities…"
              className="pl-9 h-11"
            />
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filtered.map((s) => {
              const pct = (s.occupied / s.capacity) * 100;
              const active = s.id === selected;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelected(s.id)}
                  className={cn(
                    "w-full text-left rounded-2xl border p-4 transition hover:border-primary/45 cursor-pointer",
                    active && "border-primary bg-primary/5 shadow-glow"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{s.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{s.address}</div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs px-2 py-0.5",
                        s.status === "open" && "bg-success/10 text-success border-success/20",
                        s.status === "limited" && "bg-warning/10 text-warning border-warning/20",
                        s.status === "full" && "bg-emergency/10 text-emergency border-emergency/20"
                      )}
                    >
                      {s.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span>
                      {s.occupied}/{s.capacity}
                    </span>
                    <span>
                      <MapPin className="h-3 w-3 inline mr-0.5" />
                      {s.distanceKm} km
                    </span>
                  </div>
                  <Progress value={pct} className="mt-2 h-1.5" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail / Map */}
        <Card className="overflow-hidden shadow-elegant border-border/60 flex flex-col">
          {/* Live Map Preview replaces the SVG mock map */}
          <div className="relative h-64 border-b overflow-hidden">
            <Map
              markers={markers}
              className="h-full w-full"
              onMarkerClick={(marker) => {
                setSelected(marker.id);
              }}
            />
          </div>

          {sel && (
            <CardContent className="p-6 flex-1 overflow-auto">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">{sel.name}</h2>
                  <p className="text-sm text-muted-foreground">{sel.address}</p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    sel.status === "open" && "bg-success/10 text-success border-success/20",
                    sel.status === "limited" && "bg-warning/10 text-warning border-warning/20",
                    sel.status === "full" && "bg-emergency/10 text-emergency border-emergency/20"
                  )}
                >
                  {sel.status}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-5">
                <div className="rounded-xl border p-3">
                  <div className="text-xs text-muted-foreground">Capacity</div>
                  <div className="text-lg font-semibold">{sel.capacity}</div>
                </div>
                <div className="rounded-xl border p-3">
                  <div className="text-xs text-muted-foreground">Occupied</div>
                  <div className="text-lg font-semibold">{sel.occupied}</div>
                </div>
                <div className="rounded-xl border p-3">
                  <div className="text-xs text-muted-foreground">Distance</div>
                  <div className="text-lg font-semibold">{sel.distanceKm} km</div>
                </div>
              </div>

              <div className="mt-5">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Facilities
                </div>
                <div className="flex flex-wrap gap-2">
                  {sel.facilities.map((f) => {
                    const Icon = FACILITY_ICON[f] || Building2;
                    return (
                      <Badge key={f} variant="secondary" className="rounded-full gap-1.5 font-normal py-1">
                        <Icon className="h-3 w-3" /> {f}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Button className="rounded-full shadow-glow">
                  <Navigation className="h-4 w-4 mr-1.5" />
                  Directions
                </Button>
                <Button variant="outline" className="rounded-full">
                  <Phone className="h-4 w-4 mr-1.5" />
                  {sel.contact}
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
