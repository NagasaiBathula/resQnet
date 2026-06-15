import { CITY_COORDINATES } from "@/lib/constants/map-defaults";

export type Role = "citizen" | "volunteer" | "rescue" | "authority" | "admin";

export type EmergencyType = "flood" | "cyclone" | "earthquake" | "fire" | "landslide" | "medical";

export type Severity = "low" | "medium" | "high" | "critical";

export type IncidentStatus =
  | "reported"
  | "triaged"
  | "dispatched"
  | "en-route"
  | "on-site"
  | "resolved"
  | "escalated";

export interface DemoUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: Role;
  avatar: string;
  location: string;
}

export const demoUsers: DemoUser[] = [
  {
    id: "u-1",
    email: "citizen@resqnet.app",
    password: "demo123",
    name: "Aarav Sharma",
    role: "citizen",
    avatar: "AS",
    location: "Mumbai, IN",
  },
  {
    id: "u-2",
    email: "volunteer@resqnet.app",
    password: "demo123",
    name: "Priya Patel",
    role: "volunteer",
    avatar: "PP",
    location: "Chennai, IN",
  },
  {
    id: "u-3",
    email: "rescue@resqnet.app",
    password: "demo123",
    name: "Cmdr. Rohan Mehta",
    role: "rescue",
    avatar: "RM",
    location: "Delhi, IN",
  },
  {
    id: "u-4",
    email: "authority@resqnet.app",
    password: "demo123",
    name: "Dr. Anita Rao",
    role: "authority",
    avatar: "AR",
    location: "New Delhi, IN",
  },
  {
    id: "u-5",
    email: "admin@resqnet.app",
    password: "demo123",
    name: "System Admin",
    role: "admin",
    avatar: "SA",
    location: "HQ",
  },
];

export interface Incident {
  id: string;
  _id?: string;
  caseId: string;
  type: EmergencyType;
  category?: string;
  severity: Severity | string;
  status: IncidentStatus | string;
  title: string;
  description: string;
  location: string;
  city: string;
  reporter: string;
  reportedAt: string; // ISO
  affectedPeople: number;
  assignedTeam?: string;
  assignedRescueTeam?: any;
  assignedVolunteers?: any[];
  resolutionNotes?: string;
  eta?: string;
  coordinates: { lat: number; lng: number };
  incidentNumber?: string;
  state?: string;
  district?: string;
  address?: string;
  activityLog?: any[];
  allocatedResources?: any[];
}

const cities = [
  "Mumbai",
  "Chennai",
  "Kolkata",
  "Bengaluru",
  "Hyderabad",
  "Delhi",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Kochi",
];
const types: EmergencyType[] = ["flood", "cyclone", "earthquake", "fire", "landslide", "medical"];
const statuses: IncidentStatus[] = [
  "reported",
  "triaged",
  "dispatched",
  "en-route",
  "on-site",
  "resolved",
];
const severities: Severity[] = ["low", "medium", "high", "critical"];

function rand<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

export const incidents: Incident[] = Array.from({ length: 60 }).map((_, i) => {
  const type = rand(types, i);
  const city = rand(cities, i * 3);
  const severity = rand(severities, i * 2);
  const status = rand(statuses, i * 5);
  const titles: Record<EmergencyType, string> = {
    flood: "Rising water levels reported",
    cyclone: "Cyclone wind damage",
    earthquake: "Structural damage after tremor",
    fire: "Building fire in progress",
    landslide: "Landslide blocking road",
    medical: "Medical evacuation needed",
  };

  // Deterministic coordinate clustering around the city center
  const baseCenter = CITY_COORDINATES[city] || CITY_COORDINATES.Mumbai;
  const offsetLat = (((i * 17) % 100) - 50) / 1000; // jitter range: -0.05 to +0.05 degrees
  const offsetLng = (((i * 31) % 100) - 50) / 1000;

  return {
    id: `inc-${i + 1}`,
    caseId: `CC-${(2400 + i).toString()}`,
    type,
    severity,
    status,
    title: titles[type],
    description:
      "Residents reporting urgent need for assistance. AI triage suggests immediate dispatch.",
    location: `Sector ${(i % 30) + 1}, ${city}`,
    city,
    reporter: rand(["Aarav Sharma", "Meera Iyer", "Vikram Singh", "Anonymous", "Priya Patel"], i),
    reportedAt: new Date(Date.now() - i * 1000 * 60 * 23).toISOString(),
    affectedPeople: 1 + ((i * 7) % 240),
    assignedTeam: status !== "reported" ? `Team Alpha-${(i % 8) + 1}` : undefined,
    eta: status === "en-route" ? `${5 + (i % 15)} min` : undefined,
    coordinates: { lat: baseCenter.lat + offsetLat, lng: baseCenter.lng + offsetLng },
  };
});

export interface Shelter {
  id: string;
  name: string;
  city: string;
  address: string;
  capacity: number;
  occupied: number;
  distanceKm: number;
  facilities: string[];
  contact: string;
  status: "open" | "full" | "limited";
  coordinates: { lat: number; lng: number };
}

export const shelters: Shelter[] = Array.from({ length: 24 }).map((_, i) => {
  const city = rand(cities, i);
  const cap = 100 + ((i * 37) % 400);
  const occ = Math.min(cap, Math.floor(cap * (0.3 + (i % 7) / 10)));
  const ratio = occ / cap;

  // Deterministic coordinate clustering around the city center
  const baseCenter = CITY_COORDINATES[city] || CITY_COORDINATES.Mumbai;
  // Use different multipliers so shelters do not overlap exactly with incidents
  const offsetLat = (((i * 23) % 100) - 50) / 1200;
  const offsetLng = (((i * 43) % 100) - 50) / 1200;

  return {
    id: `s-${i + 1}`,
    name: `${["Civic", "Community", "Sports", "School", "Hospital"][i % 5]} Center ${i + 1}`,
    city,
    address: `${100 + i} Main Road, ${city}`,
    capacity: cap,
    occupied: occ,
    distanceKm: Number((0.5 + (i % 12) * 1.3).toFixed(1)),
    facilities: ["Water", "Food", "Medical", "WiFi", "Power", "Beds"].slice(0, 3 + (i % 4)),
    contact: `+91 9${(1000000000 + i * 13).toString().slice(0, 9)}`,
    status: ratio >= 1 ? "full" : ratio >= 0.85 ? "limited" : "open",
    coordinates: { lat: baseCenter.lat + offsetLat, lng: baseCenter.lng + offsetLng },
  };
});

export interface Mission {
  id: string;
  title: string;
  type: EmergencyType;
  location: string;
  city: string;
  priority: Severity;
  status: "available" | "accepted" | "in-progress" | "completed";
  distanceKm: number;
  estDuration: string;
  description: string;
  volunteersNeeded: number;
  volunteersAssigned: number;
  reward: number;
}

export const missions: Mission[] = Array.from({ length: 30 }).map((_, i) => {
  const type = rand(types, i);
  const city = rand(cities, i * 2);
  const st = (["available", "accepted", "in-progress", "completed"] as const)[i % 4];
  return {
    id: `m-${i + 1}`,
    title: `${type.charAt(0).toUpperCase() + type.slice(1)} relief in ${city}`,
    type,
    location: `Sector ${(i % 20) + 1}, ${city}`,
    city,
    priority: rand(severities, i),
    status: st,
    distanceKm: Number((0.3 + (i % 15) * 0.8).toFixed(1)),
    estDuration: `${1 + (i % 5)}h ${(i * 10) % 60}m`,
    description: "Distribute supplies, assist evacuation, and provide on-ground coordination.",
    volunteersNeeded: 3 + (i % 6),
    volunteersAssigned: i % 4,
    reward: 50 + (i % 10) * 25,
  };
});

export interface NotificationItem {
  id: string;
  type: "sos" | "assigned" | "dispatched" | "shelter" | "escalated" | "resolved" | "info";
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

export const notifications: NotificationItem[] = [
  {
    id: "n1",
    type: "sos",
    title: "New SOS received",
    body: "Flood emergency reported near Sector 12, Mumbai. AI triage: HIGH.",
    time: "2m ago",
    unread: true,
  },
  {
    id: "n2",
    type: "dispatched",
    title: "Rescue team dispatched",
    body: "Team Alpha-3 en route to CC-2412. ETA 7 minutes.",
    time: "8m ago",
    unread: true,
  },
  {
    id: "n3",
    type: "shelter",
    title: "Shelter available",
    body: "Civic Center 4 has 38 open beds 1.2km away.",
    time: "22m ago",
    unread: true,
  },
  {
    id: "n4",
    type: "assigned",
    title: "Volunteer assigned",
    body: "Priya Patel joined mission Cyclone relief in Chennai.",
    time: "1h ago",
    unread: false,
  },
  {
    id: "n5",
    type: "escalated",
    title: "Incident escalated",
    body: "CC-2407 escalated to national authority due to severity.",
    time: "2h ago",
    unread: false,
  },
  {
    id: "n6",
    type: "resolved",
    title: "Incident resolved",
    body: "CC-2389 marked resolved. 42 citizens assisted.",
    time: "5h ago",
    unread: false,
  },
];

export const analytics = {
  emergencyTypes: [
    { name: "Flood", value: 142 },
    { name: "Fire", value: 88 },
    { name: "Medical", value: 76 },
    { name: "Cyclone", value: 54 },
    { name: "Earthquake", value: 31 },
    { name: "Landslide", value: 22 },
  ],
  responseTimes: Array.from({ length: 12 }).map((_, i) => ({
    month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
    avg: 12 + ((i * 7) % 14),
    target: 10,
  })),
  monthlyTrends: Array.from({ length: 12 }).map((_, i) => ({
    month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
    reported: 80 + ((i * 17) % 120),
    resolved: 60 + ((i * 13) % 110),
  })),
  shelterOccupancy: shelters.slice(0, 8).map((s) => ({
    name: s.name.split(" ").slice(0, 2).join(" "),
    occupied: s.occupied,
    capacity: s.capacity,
  })),
  regional: cities.slice(0, 8).map((c, i) => ({ city: c, incidents: 20 + ((i * 19) % 80) })),
  satisfaction: 92,
};

export const aiSuggestedPrompts = [
  "What should I do during a flood?",
  "How do I prepare for a cyclone?",
  "Earthquake safety checklist",
  "Nearest hospital with trauma care",
  "Help me build a family emergency plan",
];

export function generateAIResponse(question: string): string {
  const q = question.toLowerCase();
  if (q.includes("flood"))
    return "During a flood: move to higher ground immediately, avoid walking or driving through flowing water, disconnect electrical appliances, keep an emergency kit ready with water, food, flashlight, and medication. I can locate the nearest shelter for you — shall I?";
  if (q.includes("cyclone"))
    return "Cyclone preparation: secure outdoor objects, stock 3 days of water and food, charge devices, identify the strongest interior room, and monitor official advisories. Based on your location, the nearest cyclone shelter is 2.4 km away.";
  if (q.includes("earthquake"))
    return "Earthquake safety: Drop, Cover, and Hold On. Stay away from windows and heavy furniture. After shaking stops, check for injuries and gas leaks, then evacuate if the building is damaged. I can dispatch a rescue team if needed.";
  if (q.includes("fire"))
    return "Fire emergency: evacuate immediately, stay low to avoid smoke, do not use elevators, close doors behind you, and call emergency services. I can route the nearest fire response unit to your location.";
  if (q.includes("medical") || q.includes("hospital"))
    return "I've identified 3 hospitals within 5 km. The closest with trauma care is City General Hospital — 1.8 km, ~6 min by ambulance. Want me to request a medical evacuation?";
  if (q.includes("plan"))
    return "Here's a starting family emergency plan: 1) Designate a meeting point, 2) Save emergency contacts, 3) Prepare a go-bag (water, food, medication, documents), 4) Practice evacuation drills quarterly, 5) Subscribe to local alerts. I can generate a printable version.";
  return "I'm here to help. Could you share more about your situation — location, type of emergency, and number of people involved? I'll guide you step-by-step and can coordinate with rescue teams if needed.";
}
