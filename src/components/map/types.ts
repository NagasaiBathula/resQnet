import { Coordinate } from "@/lib/constants/map-defaults";

export type MarkerType = "incident" | "shelter" | "user";

export interface MapMarker {
  id: string;
  position: Coordinate;
  type: MarkerType;
  title: string;
  subtitle?: string;
  severity?: "low" | "medium" | "high" | "critical";
  status?: string;
  meta?: Record<string, any>;
}

export interface MapRegion {
  id: string;
  name: string;
  state: string;
  district: string;
  coordinates: Coordinate[];
}

export interface MapComponentProps {
  markers?: MapMarker[];
  regions?: MapRegion[];
  center?: Coordinate;
  zoom?: number;
  showUserLocation?: boolean;
  userLocation?: Coordinate;
  className?: string;
  onMarkerClick?: (marker: MapMarker) => void;
  onMapClick?: (coord: Coordinate) => void;
  interactive?: boolean;
}
