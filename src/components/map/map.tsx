import React, { Suspense, lazy, useEffect, useState } from "react";
import { MapComponentProps } from "./types";

const LazyLeafletMap = lazy(() => import("./leaflet-map"));

export const Map: React.FC<MapComponentProps> = (props) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div
        className={`h-full w-full bg-muted/30 animate-pulse flex items-center justify-center rounded-2xl ${props.className || ""}`}
      >
        <div className="flex flex-col items-center gap-2.5 text-muted-foreground text-xs font-medium tracking-wide">
          <svg className="animate-spin h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading map assets...
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div
          className={`h-full w-full bg-muted/30 animate-pulse flex items-center justify-center rounded-2xl ${props.className || ""}`}
        >
          <div className="text-muted-foreground text-xs font-medium tracking-wide">Initializing map...</div>
        </div>
      }
    >
      <LazyLeafletMap {...props} />
    </Suspense>
  );
};
