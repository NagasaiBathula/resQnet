import React, { createContext, useContext, useState, useCallback } from "react";
import { Coordinate, DEFAULT_CENTER, DEFAULT_ZOOM } from "@/lib/constants/map-defaults";

interface MapContextType {
  center: Coordinate;
  zoom: number;
  activeMarkerId: string | null;
  userLocation: Coordinate | null;
  setCenter: (center: Coordinate) => void;
  setZoom: (zoom: number) => void;
  setActiveMarkerId: (id: string | null) => void;
  setUserLocation: (loc: Coordinate | null) => void;
  panTo: (coord: Coordinate, zoom?: number) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [center, setCenterState] = useState<Coordinate>(DEFAULT_CENTER);
  const [zoom, setZoomState] = useState<number>(DEFAULT_ZOOM);
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);

  const setCenter = useCallback((newCenter: Coordinate) => {
    setCenterState(newCenter);
  }, []);

  const setZoom = useCallback((newZoom: number) => {
    setZoomState(newZoom);
  }, []);

  const panTo = useCallback((coord: Coordinate, newZoom?: number) => {
    setCenterState(coord);
    if (newZoom !== undefined) {
      setZoomState(newZoom);
    }
  }, []);

  return (
    <MapContext.Provider
      value={{
        center,
        zoom,
        activeMarkerId,
        userLocation,
        setCenter,
        setZoom,
        setActiveMarkerId,
        setUserLocation,
        panTo,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export const useMapController = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMapController must be used within a MapProvider");
  }
  return context;
};
