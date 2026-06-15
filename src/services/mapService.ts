import { Coordinate } from "@/lib/constants/map-defaults";
import { incidents, shelters, Incident, Shelter } from "@/lib/mock-data";

// Helper function to calculate distance using Haversine formula
export function calculateDistance(coord1: Coordinate, coord2: Coordinate): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const mapService = {
  getIncidents(): Promise<Incident[]> {
    return Promise.resolve(incidents);
  },

  getShelters(): Promise<Shelter[]> {
    return Promise.resolve(shelters);
  },

  getNearbyShelters(coord: Coordinate, limit = 5): Promise<Shelter[]> {
    const sorted = [...shelters].sort((a, b) => {
      const distA = calculateDistance(coord, a.coordinates);
      const distB = calculateDistance(coord, b.coordinates);
      return distA - distB;
    });
    return Promise.resolve(sorted.slice(0, limit));
  },

  getIncidentById(id: string): Promise<Incident | undefined> {
    const incident = incidents.find((i) => i.id === id);
    return Promise.resolve(incident);
  },

  getShelterById(id: string): Promise<Shelter | undefined> {
    const shelter = shelters.find((s) => s.id === id);
    return Promise.resolve(shelter);
  },
};
