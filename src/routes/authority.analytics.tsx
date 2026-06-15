import { createFileRoute } from "@tanstack/react-router";
import { FeaturePage } from "@/components/feature-page";
import { BarChart3, Clock, TrendingUp, Download, Target } from "lucide-react";
import { analytics } from "@/lib/mock-data";

export const Route = createFileRoute("/authority/analytics")({
  head: () => ({ meta: [{ title: "National Analytics — ResQNet" }] }),
  component: () => (
    <FeaturePage
      title="National analytics"
      subtitle="Cross-region performance, trends, and outcomes."
      stats={[
        { label: "Incidents YTD", value: "12,840", sublabel: "+8% YoY", icon: BarChart3, accent: "primary" },
        { label: "Resolution rate", value: "94%", sublabel: "within SLA", icon: Target, accent: "success" },
        { label: "Avg response", value: "9m 18s", sublabel: "−14% YoY", icon: Clock, accent: "info" },
        { label: "Citizen NPS", value: "+62", sublabel: "+5 QoQ", icon: TrendingUp, accent: "warning" },
      ]}
      extraActions={[{ label: "Export PDF", icon: Download }]}
      charts={[
        { title: "Reported vs resolved · monthly", type: "area", data: analytics.monthlyTrends, xKey: "month", series: [{ key: "reported" }, { key: "resolved" }] },
        { title: "Emergency types share", type: "pie", data: analytics.emergencyTypes, xKey: "name", series: [{ key: "value" }] },
        { title: "Response time trend (min)", type: "line", data: analytics.responseTimes, xKey: "month", series: [{ key: "avg", label: "Actual" }, { key: "target", label: "Target", color: "var(--color-emergency)" }] },
        { title: "Regional load", type: "bar", data: analytics.regional, xKey: "city", series: [{ key: "incidents" }] },
      ]}
    />
  ),
});
