import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Coordinate } from "@/lib/constants/map-defaults";
import { MapComponentProps, MapMarker, MarkerType } from "./types";
import { useMapController } from "./map-provider";

// Resolve Leaflet default icon path bugs by using custom SVGs in L.divIcon
const getSeverityColor = (severity?: string) => {
  switch (severity) {
    case "critical":
      return "var(--color-emergency)";
    case "high":
      return "var(--color-warning)";
    case "medium":
      return "#EAB308"; // Amber 500
    default:
      return "var(--color-info)";
  }
};

const getShelterColor = (status?: string) => {
  switch (status) {
    case "full":
      return "var(--color-emergency)";
    case "limited":
      return "var(--color-warning)";
    default:
      return "var(--color-success)";
  }
};

const createMarkerIcon = (type: MarkerType, severity?: string, status?: string) => {
  if (type === "user") {
    return L.divIcon({
      html: `
        <div class="relative flex h-5 w-5">
          <span class="animate-pulse absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-5 w-5 bg-primary border-2 border-white shadow-glow"></span>
        </div>
      `,
      className: "custom-user-marker",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  }

  if (type === "incident") {
    const color = getSeverityColor(severity);
    const isCritical = severity === "critical";

    return L.divIcon({
      html: `
        <div class="relative flex items-center justify-center w-8 h-8 rounded-full shadow-elegant border-2 border-white text-white transition-transform duration-200 hover:scale-110" style="background-color: ${color}">
          ${isCritical ? `<span class="absolute inset-0 rounded-full animate-ping opacity-45" style="background-color: ${color}"></span>` : ""}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
      `,
      className: "custom-incident-marker",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  }

  if (type === "resource") {
    return L.divIcon({
      html: `
        <div class="flex items-center justify-center w-7 h-7 rounded-full shadow-elegant border-2 border-white text-white bg-primary transition-transform duration-200 hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="1" y="3" width="15" height="13" rx="2" ry="2"/>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
            <circle cx="5.5" cy="18.5" r="2.5"/>
            <circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
        </div>
      `,
      className: "custom-resource-marker",
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14],
    });
  }

  // Shelter icon
  const color = getShelterColor(status);
  return L.divIcon({
    html: `
      <div class="flex items-center justify-center w-8 h-8 rounded-full shadow-elegant border-2 border-white text-white transition-transform duration-200 hover:scale-110" style="background-color: ${color}">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </div>
    `,
    className: "custom-shelter-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

// Component to handle panTo/zoom updates reactively
const MapUpdater: React.FC<{ center: Coordinate; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
};

// Component to handle map clicks
const MapEventsHandler: React.FC<{ onMapClick?: (coord: Coordinate) => void }> = ({
  onMapClick,
}) => {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
};

const LeafletMap: React.FC<MapComponentProps> = ({
  markers = [],
  center,
  zoom,
  showUserLocation = false,
  userLocation,
  className,
  onMarkerClick,
  onMapClick,
  interactive = true,
}) => {
  const controller = useMapController();

  // Keep state synced with the controller if the parent didn't specify values
  const mapCenter = center || controller.center;
  const mapZoom = zoom || controller.zoom;
  const mapUserLocation = userLocation || controller.userLocation;

  // Sync user location marker if it is defined and we want to show it
  const displayUserLocation = showUserLocation && mapUserLocation;

  return (
    <MapContainer
      center={[mapCenter.lat, mapCenter.lng]}
      zoom={mapZoom}
      className={className || "h-full w-full"}
      zoomControl={interactive}
      doubleClickZoom={interactive}
      scrollWheelZoom={interactive}
      boxZoom={interactive}
      keyboard={interactive}
      dragging={interactive}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      <MapUpdater center={mapCenter} zoom={mapZoom} />
      <MapEventsHandler onMapClick={onMapClick} />

      {displayUserLocation && (
        <Marker
          position={[mapUserLocation.lat, mapUserLocation.lng]}
          icon={createMarkerIcon("user")}
        >
          <Popup>
            <div className="text-xs font-semibold">My Current Location</div>
          </Popup>
        </Marker>
      )}

      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.position.lat, marker.position.lng]}
          icon={createMarkerIcon(marker.type, marker.severity, marker.status)}
          eventHandlers={{
            click: () => {
              if (onMarkerClick) onMarkerClick(marker);
              controller.setActiveMarkerId(marker.id);
            },
          }}
        >
          <Popup>
            <div className="p-1 min-w-[140px] text-foreground">
              <div className="font-semibold text-sm truncate">{marker.title}</div>
              {marker.subtitle && (
                <div className="text-xs text-muted-foreground mt-0.5">{marker.subtitle}</div>
              )}
              <div className="mt-2 flex items-center justify-between text-[10px]">
                {marker.type === "incident" && marker.severity && (
                  <span
                    className="px-1.5 py-0.5 rounded-full text-white font-medium capitalize"
                    style={{ backgroundColor: getSeverityColor(marker.severity) }}
                  >
                    {marker.severity}
                  </span>
                )}
                {marker.type === "shelter" && marker.status && (
                  <span
                    className="px-1.5 py-0.5 rounded-full text-white font-medium capitalize"
                    style={{ backgroundColor: getShelterColor(marker.status) }}
                  >
                    {marker.status}
                  </span>
                )}
                <span className="text-muted-foreground capitalize">{marker.type}</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default LeafletMap;
