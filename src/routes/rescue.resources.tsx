import { createFileRoute } from "@tanstack/react-router";
import { FeaturePage, PillBadge } from "@/components/feature-page";
import { Boxes, HeartPulse, Shirt, Droplet, Plus } from "lucide-react";

const items = [
  {
    id: "r-1",
    sku: "MED-001",
    name: "Trauma kits",
    category: "Medical",
    stock: 142,
    par: 200,
    region: "Mumbai",
    status: "ok",
  },
  {
    id: "r-2",
    sku: "MED-014",
    name: "IV fluid bags",
    category: "Medical",
    stock: 58,
    par: 150,
    region: "Chennai",
    status: "low",
  },
  {
    id: "r-3",
    sku: "FOOD-022",
    name: "MRE rations",
    category: "Food",
    stock: 1240,
    par: 2000,
    region: "Delhi",
    status: "ok",
  },
  {
    id: "r-4",
    sku: "WTR-007",
    name: "Bottled water (L)",
    category: "Water",
    stock: 8200,
    par: 10000,
    region: "Pune",
    status: "ok",
  },
  {
    id: "r-5",
    sku: "SHL-013",
    name: "Emergency tents",
    category: "Shelter",
    stock: 64,
    par: 120,
    region: "Kochi",
    status: "low",
  },
  {
    id: "r-6",
    sku: "MED-008",
    name: "AED units",
    category: "Medical",
    stock: 22,
    par: 40,
    region: "Bengaluru",
    status: "ok",
  },
  {
    id: "r-7",
    sku: "TOOL-019",
    name: "Generators (kW)",
    category: "Tools",
    stock: 14,
    par: 30,
    region: "Hyderabad",
    status: "low",
  },
  {
    id: "r-8",
    sku: "COMS-002",
    name: "Satellite phones",
    category: "Comms",
    stock: 38,
    par: 50,
    region: "Jaipur",
    status: "ok",
  },
  {
    id: "r-9",
    sku: "MED-020",
    name: "Blood plasma",
    category: "Medical",
    stock: 12,
    par: 60,
    region: "Mumbai",
    status: "critical",
  },
  {
    id: "r-10",
    sku: "WTR-009",
    name: "Water filters",
    category: "Water",
    stock: 88,
    par: 100,
    region: "Chennai",
    status: "ok",
  },
  {
    id: "r-11",
    sku: "SHL-022",
    name: "Sleeping bags",
    category: "Shelter",
    stock: 410,
    par: 500,
    region: "Delhi",
    status: "ok",
  },
  {
    id: "r-12",
    sku: "TOOL-007",
    name: "Chainsaws",
    category: "Tools",
    stock: 17,
    par: 25,
    region: "Pune",
    status: "low",
  },
];

export const Route = createFileRoute("/rescue/resources")({
  head: () => ({ meta: [{ title: "Resources — ResQNet" }] }),
  component: () => (
    <FeaturePage
      title="Resources & inventory"
      subtitle="Live stock across all regional depots."
      stats={[
        {
          label: "SKUs tracked",
          value: "184",
          sublabel: "12 categories",
          icon: Boxes,
          accent: "primary",
        },
        { label: "Medical units", value: "1,420", icon: HeartPulse, accent: "emergency" },
        { label: "Shelter items", value: "984", icon: Shirt, accent: "info" },
        {
          label: "Water (L)",
          value: "82,400",
          sublabel: "82% of par",
          icon: Droplet,
          accent: "success",
        },
      ]}
      primaryAction={{ label: "Restock order", icon: Plus }}
      filters={["All", "Medical", "Food", "Water", "Shelter", "Comms", "Tools"]}
      tableTitle="Inventory"
      tableCols={[
        {
          key: "sku",
          label: "SKU",
          render: (r) => <span className="font-mono text-xs">{r.sku}</span>,
        },
        {
          key: "name",
          label: "Item",
          render: (r) => <span className="text-sm font-medium">{r.name}</span>,
        },
        { key: "category", label: "Category" },
        {
          key: "stock",
          label: "Stock",
          render: (r) => <span className="text-sm">{r.stock.toLocaleString()}</span>,
        },
        {
          key: "par",
          label: "Par",
          render: (r) => (
            <span className="text-xs text-muted-foreground">{r.par.toLocaleString()}</span>
          ),
        },
        { key: "region", label: "Region" },
        {
          key: "status",
          label: "Status",
          render: (r) => (
            <PillBadge
              tone={
                r.status === "critical" ? "emergency" : r.status === "low" ? "warning" : "success"
              }
            >
              {r.status}
            </PillBadge>
          ),
        },
      ]}
      tableRows={items}
      progressTitle="Critical levels"
      progressRows={[
        { label: "Blood plasma · Mumbai", value: 12, max: 60, sub: "20% of par" },
        { label: "Chainsaws · Pune", value: 17, max: 25 },
        { label: "Generators · Hyderabad", value: 14, max: 30 },
        { label: "Emergency tents · Kochi", value: 64, max: 120 },
      ]}
    />
  ),
});
