export interface Coordinate {
  lat: number;
  lng: number;
}

export const INDIA_CENTER: Coordinate = {
  lat: 20.5937,
  lng: 78.9629,
};

export const DEFAULT_CENTER: Coordinate = INDIA_CENTER;
export const DEFAULT_ZOOM = 5;

export const ANDHRA_PRADESH_CENTER: Coordinate = { lat: 15.9129, lng: 79.74 };
export const TELANGANA_CENTER: Coordinate = { lat: 18.1124, lng: 79.0193 };
export const KARNATAKA_CENTER: Coordinate = { lat: 15.3173, lng: 75.7139 };
export const TAMIL_NADU_CENTER: Coordinate = { lat: 11.1271, lng: 78.6569 };
export const KERALA_CENTER: Coordinate = { lat: 10.8505, lng: 76.2711 };

export const CITY_COORDINATES: Record<string, Coordinate> = {
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Kolkata: { lat: 22.5726, lng: 88.3639 },
  Bengaluru: { lat: 12.9716, lng: 77.5946 },
  Hyderabad: { lat: 17.385, lng: 78.4867 },
  Delhi: { lat: 28.7041, lng: 77.1025 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Ahmedabad: { lat: 23.0225, lng: 72.5714 },
  Jaipur: { lat: 26.9124, lng: 75.7873 },
  Kochi: { lat: 9.9312, lng: 76.2673 },
};
