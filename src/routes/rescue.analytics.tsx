import { createFileRoute } from "@tanstack/react-router";
import { FeaturePage } from "@/components/feature-page";
import { BarChart3, Clock, Target, TrendingUp, Download } from "lucide-react";
import { analytics } from "@/lib/mock-data";

const teamPerf = ["Alpha", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot"].map((t, i) => ({
  name: t,
  missions: 40 + ((i * 11) % 60),
  avg: 6 + ((i * 3) % 8),
}));

export const Route = createFileRoute("/rescue/analytics")({
  head: () => ({ meta: [{ title: "Operational Analytics — ResQNet" }] }),
  component: () => (
    <FeaturePage
      title="Operational analytics"
      subtitle="Response times, outcomes, and operational load."
      stats={[
        {
          label: "Avg response",
          value: "8m 42s",
          sublabel: "−12% vs target",
          icon: Clock,
          accent: "success",
        },
        {
          label: "Closed today",
          value: "184",
          sublabel: "94% within SLA",
          icon: Target,
          accent: "primary",
        },
        {
          label: "Open SLA breach",
          value: "3",
          sublabel: "all critical",
          icon: BarChart3,
          accent: "warning",
        },
        {
          label: "Outcome score",
          value: "92",
          sublabel: "+4 wow",
          icon: TrendingUp,
          accent: "info",
        },
      ]}
      extraActions={[{ label: "Export report", icon: Download }]}
      charts={[
        {
          title: "Response time trend (min)",
          type: "line",
          data: analytics.responseTimes,
          xKey: "month",
          series: [
            { key: "avg", label: "Actual" },
            { key: "target", label: "Target", color: "var(--color-emergency)" },
          ],
        },
        {
          title: "Incidents by region",
          type: "bar",
          data: analytics.regional,
          xKey: "city",
          series: [{ key: "incidents" }],
        },
      ]}
      tableTitle="Team performance"
      tableCols={[
        {
          key: "name",
          label: "Team",
          render: (r) => <span className="font-medium">{r.name} Squad</span>,
        },
        { key: "missions", label: "Missions" },
        { key: "avg", label: "Avg response (min)" },
      ]}
      tableRows={teamPerf}
      sideCards={[
        {
          title: "Top contributors",
          items: [
            { label: "Cmdr. Rohan Mehta", value: "48 ops" },
            { label: "Priya Patel", value: "41 ops" },
            { label: "Vikram Singh", value: "38 ops" },
            { label: "Meera Iyer", value: "33 ops" },
          ],
        },
      ]}
    />
  ),
});
