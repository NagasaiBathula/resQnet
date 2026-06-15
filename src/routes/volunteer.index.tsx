import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { incidents, missions, analytics } from "@/lib/mock-data";
import { StatCard, SectionTitle, typeIcon, typeColor, SeverityBadge } from "@/components/shared";
import {
  Activity,
  Award,
  Users,
  Target,
  MapPin,
  Clock,
  ArrowRight,
  TrendingUp,
  Heart,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { incidentService } from "@/services/incidentService";

export const Route = createFileRoute("/volunteer/")({
  head: () => ({ meta: [{ title: "Volunteer Dashboard — ResQNet" }] }),
  component: VolunteerDashboard,
});

function VolunteerDashboard() {
  const [assignedMissions, setAssignedMissions] = useState<any[]>([]);

  useEffect(() => {
    incidentService
      .getMyIncidents()
      .then(setAssignedMissions)
      .catch((err) => console.error("Error loading volunteer incidents:", err));
  }, []);

  const available = missions.filter((m) => m.status === "available").slice(0, 4);
  const activeCount = assignedMissions.filter((i) => i.status !== "Resolved").length;

  return (
    <AppShell
      title="Mission control"
      actions={
        <Button asChild className="rounded-full shadow-glow">
          <Link to="/volunteer/operations">
            My Active Missions <ArrowRight className="h-4 w-4 ml-1.5" />
          </Link>
        </Button>
      }
    >
      <p className="text-muted-foreground -mt-1 mb-6">
        You've helped <span className="text-foreground font-medium">142 citizens</span> this
        quarter. Keep going.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Link to="/volunteer/operations" className="contents">
          <StatCard
            label="Active missions"
            value={activeCount.toString()}
            sublabel={`${assignedMissions.filter((i) => i.status === "In Progress").length} in progress`}
            icon={Activity}
            accent="primary"
            delay={0}
          />
        </Link>
        <StatCard
          label="Completed"
          value="38"
          sublabel="this year"
          icon={Target}
          accent="success"
          delay={0.05}
        />
        <StatCard
          label="Citizens assisted"
          value="142"
          sublabel="+12 this week"
          icon={Heart}
          accent="info"
          delay={0.1}
        />
        <StatCard
          label="Impact score"
          value="9,420"
          sublabel="Top 4% nationwide"
          icon={Award}
          accent="warning"
          delay={0.15}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <SectionTitle
              title="Mission feed"
              action={
                <Button asChild size="sm" variant="ghost">
                  <Link to="/volunteer/missions">View all</Link>
                </Button>
              }
            />
            <div className="space-y-2">
              {available.map((m) => {
                const Icon = typeIcon[m.type];
                return (
                  <Link to="/volunteer/active" key={m.id} className="block">
                    <motion.div
                      whileHover={{ x: 2 }}
                      className="rounded-xl border p-4 hover:bg-accent/40 transition"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "h-11 w-11 rounded-xl flex items-center justify-center shrink-0",
                            typeColor[m.type],
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold">{m.title}</span>
                            <SeverityBadge severity={m.priority} />
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 flex gap-3 flex-wrap">
                            <span>
                              <MapPin className="h-3 w-3 inline mr-0.5" />
                              {m.location} · {m.distanceKm} km
                            </span>
                            <span>
                              <Clock className="h-3 w-3 inline mr-0.5" />
                              {m.estDuration}
                            </span>
                            <span>
                              <Users className="h-3 w-3 inline mr-0.5" />
                              {m.volunteersAssigned}/{m.volunteersNeeded}
                            </span>
                          </div>
                        </div>
                        <Button size="sm" className="rounded-full shrink-0">
                          Accept
                        </Button>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <SectionTitle title="Achievements" />
            <div className="space-y-3">
              {[
                { t: "Floods Hero", d: "10 flood missions completed", p: 100 },
                { t: "Lifesaver", d: "100 citizens assisted", p: 100 },
                { t: "First Responder", d: "Reach 50 missions", p: 76 },
                { t: "Marathon", d: "30 day streak", p: 40 },
              ].map((a) => (
                <div key={a.t} className="rounded-xl border p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{a.t}</span>
                    <span className="text-xs text-muted-foreground">{a.p}%</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">{a.d}</div>
                  <Progress value={a.p} className="mt-2 h-1.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardContent className="p-5">
          <SectionTitle title="Your impact over time" />
          <div className="h-60">
            <ResponsiveContainer>
              <LineChart data={analytics.monthlyTrends}>
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
                <Line
                  type="monotone"
                  dataKey="resolved"
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
