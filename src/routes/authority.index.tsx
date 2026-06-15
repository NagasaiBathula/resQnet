import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { StatCard, SectionTitle } from "@/components/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Users,
  Building2,
  Shield,
  Globe2,
  TrendingUp,
  ArrowRight,
  Download,
} from "lucide-react";
import { analytics } from "@/lib/mock-data";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

export const Route = createFileRoute("/authority/")({
  head: () => ({ meta: [{ title: "National Overview — ResQNet" }] }),
  component: AuthorityDashboard,
});

const COLORS = ["#2563EB", "#DC2626", "#16A34A", "#F97316", "#0EA5E9", "#A855F7"];

function AuthorityDashboard() {
  return (
    <AppShell
      title="National command"
      actions={
        <>
          <Button variant="outline" className="rounded-full">
            <Download className="h-4 w-4 mr-1.5" />
            Export brief
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/authority/monitoring">
              <Globe2 className="h-4 w-4 mr-1.5" />
              Live map
            </Link>
          </Button>
          <Button asChild className="rounded-full shadow-glow">
            <Link to="/authority/dispatch">
              <Shield className="h-4 w-4 mr-1.5" />
              Dispatch console
            </Link>
          </Button>
        </>
      }
    >
      <p className="text-muted-foreground -mt-1 mb-6">
        Real-time situational awareness across 47 cities · all systems nominal
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Active incidents"
          value="247"
          sublabel="12 critical"
          icon={Activity}
          accent="emergency"
          delay={0}
        />
        <StatCard
          label="Citizens helped"
          value="12.4k"
          sublabel="+184 today"
          icon={Users}
          accent="primary"
          delay={0.05}
        />
        <StatCard
          label="Shelter capacity"
          value="68%"
          sublabel="22.4k beds open"
          icon={Building2}
          accent="success"
          delay={0.1}
        />
        <StatCard
          label="Teams deployed"
          value="42"
          sublabel="across 18 cities"
          icon={Shield}
          accent="info"
          delay={0.15}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <SectionTitle
              title="Monthly trends"
              action={
                <Button size="sm" variant="ghost">
                  12 months <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              }
            />
            <div className="h-72">
              <ResponsiveContainer>
                <AreaChart data={analytics.monthlyTrends}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" fontSize={11} stroke="currentColor" opacity={0.5} />
                  <YAxis fontSize={11} stroke="currentColor" opacity={0.5} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--color-border)",
                      background: "var(--color-card)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="reported"
                    stroke="var(--color-primary)"
                    fill="url(#g1)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="resolved"
                    stroke="var(--color-success)"
                    fill="url(#g2)"
                    strokeWidth={2}
                  />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <SectionTitle title="Emergency mix" />
            <div className="h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={analytics.emergencyTypes}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {analytics.emergencyTypes.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--color-border)",
                      background: "var(--color-card)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="grid grid-cols-2 gap-2 text-xs mt-2">
              {analytics.emergencyTypes.map((t, i) => (
                <li key={t.name} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i] }} />
                  <span className="text-muted-foreground">{t.name}</span>
                  <span className="ml-auto font-medium">{t.value}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <Card>
          <CardContent className="p-5">
            <SectionTitle title="Response time vs target" />
            <div className="h-60">
              <ResponsiveContainer>
                <LineChart data={analytics.responseTimes}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" fontSize={11} stroke="currentColor" opacity={0.5} />
                  <YAxis fontSize={11} stroke="currentColor" opacity={0.5} unit="m" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--color-border)",
                      background: "var(--color-card)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avg"
                    stroke="var(--color-primary)"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="var(--color-emergency)"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <SectionTitle title="Regional distribution" />
            <div className="h-60">
              <ResponsiveContainer>
                <BarChart data={analytics.regional} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis type="number" fontSize={11} stroke="currentColor" opacity={0.5} />
                  <YAxis
                    dataKey="city"
                    type="category"
                    fontSize={11}
                    stroke="currentColor"
                    opacity={0.5}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--color-border)",
                      background: "var(--color-card)",
                    }}
                  />
                  <Bar dataKey="incidents" fill="var(--color-primary)" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
