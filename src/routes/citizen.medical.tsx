import { createFileRoute } from "@tanstack/react-router";
import { FeaturePage, PillBadge } from "@/components/feature-page";
import { HeartPulse, Phone, Ambulance, Activity, Droplet, Plus } from "lucide-react";

const hospitals = [
  {
    id: "h-1",
    name: "City General Hospital",
    region: "Mumbai",
    distanceKm: 1.8,
    beds: 24,
    icu: 4,
    trauma: true,
    status: "open",
  },
  {
    id: "h-2",
    name: "Marina Care Center",
    region: "Mumbai",
    distanceKm: 3.4,
    beds: 12,
    icu: 2,
    trauma: true,
    status: "open",
  },
  {
    id: "h-3",
    name: "Sunrise Specialty",
    region: "Mumbai",
    distanceKm: 4.1,
    beds: 0,
    icu: 0,
    trauma: false,
    status: "full",
  },
  {
    id: "h-4",
    name: "Lotus Childcare",
    region: "Mumbai",
    distanceKm: 5.2,
    beds: 8,
    icu: 1,
    trauma: false,
    status: "limited",
  },
  {
    id: "h-5",
    name: "Apex Trauma & Surgery",
    region: "Mumbai",
    distanceKm: 6.5,
    beds: 18,
    icu: 6,
    trauma: true,
    status: "open",
  },
  {
    id: "h-6",
    name: "Greenleaf Clinic",
    region: "Mumbai",
    distanceKm: 7.2,
    beds: 6,
    icu: 0,
    trauma: false,
    status: "open",
  },
];

const contacts = [
  { label: "National emergency", number: "112" },
  { label: "Ambulance", number: "108" },
  { label: "Fire", number: "101" },
  { label: "Disaster helpline", number: "1078" },
  { label: "Women safety", number: "1091" },
  { label: "Poison control", number: "1066" },
];

export const Route = createFileRoute("/citizen/medical")({
  head: () => ({ meta: [{ title: "Medical Help — ResQNet" }] }),
  component: () => (
    <FeaturePage
      title="Medical help"
      subtitle="Find nearby hospitals, request an ambulance, and access emergency contacts."
      stats={[
        {
          label: "Hospitals nearby",
          value: "12",
          sublabel: "within 10 km",
          icon: HeartPulse,
          accent: "emergency",
        },
        { label: "ICU beds free", value: "18", icon: Activity, accent: "warning" },
        { label: "Ambulances ready", value: "9", icon: Ambulance, accent: "primary" },
        {
          label: "Blood units",
          value: "240",
          sublabel: "all groups",
          icon: Droplet,
          accent: "info",
        },
      ]}
      primaryAction={{ label: "Request ambulance", icon: Ambulance }}
      extraActions={[{ label: "Call 108", icon: Phone }]}
      tableTitle="Hospitals near you"
      filters={["All", "Trauma center", "ICU available", "Open beds"]}
      tableCols={[
        {
          key: "name",
          label: "Hospital",
          render: (r) => <span className="text-sm font-medium">{r.name}</span>,
        },
        {
          key: "distanceKm",
          label: "Distance",
          render: (r) => <span className="text-xs">{r.distanceKm} km</span>,
        },
        { key: "beds", label: "Beds free" },
        { key: "icu", label: "ICU free" },
        {
          key: "trauma",
          label: "Trauma",
          render: (r) =>
            r.trauma ? (
              <PillBadge tone="success">Yes</PillBadge>
            ) : (
              <PillBadge tone="muted">No</PillBadge>
            ),
        },
        {
          key: "status",
          label: "Status",
          render: (r) => (
            <PillBadge
              tone={
                r.status === "open" ? "success" : r.status === "limited" ? "warning" : "emergency"
              }
            >
              {r.status}
            </PillBadge>
          ),
        },
      ]}
      tableRows={hospitals}
      sideCards={[
        {
          title: "Emergency contacts",
          items: contacts.map((c) => ({
            label: c.label,
            value: <span className="font-mono">{c.number}</span>,
          })),
        },
        {
          title: "My medical profile",
          items: [
            { label: "Blood type", value: "O+" },
            { label: "Allergies", value: "Penicillin" },
            { label: "Medications", value: "None" },
            { label: "Emergency contact", value: "Asha S." },
          ],
        },
      ]}
    />
  ),
});
