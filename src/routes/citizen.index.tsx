import { AppShell } from "@/components/app-shell";
import { StatCard, SectionTitle, SeverityBadge, StatusBadge, typeIcon, typeColor } from "@/components/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { shelters, notifications, analytics } from "@/lib/mock-data";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle, ShieldAlert, Building2, MessageSquareText, MapPin, CloudRain,
  Sun, ArrowRight, Heart, Sparkles, Activity
} from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { useState, useEffect } from "react";
import { incidentService } from "@/services/incidentService";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/citizen/")({
  head: () => ({ meta: [{ title: "Citizen Dashboard — ResQNet" }] }),
  component: CitizenDashboard,
});

const mapCategoryToKey = (category: string) => {
  const c = category?.toLowerCase() || "";
  if (c.includes("medical")) return "medical";
  if (c.includes("flood")) return "flood";
  if (c.includes("fire")) return "fire";
  if (c.includes("cyclone")) return "cyclone";
  if (c.includes("earthquake")) return "earthquake";
  if (c.includes("landslide")) return "landslide";
  return "medical"; // fallback
};

function CitizenDashboard() {
  const { user } = useAuth();
  const [myIncidents, setMyIncidents] = useState<any[]>([]);
  const near = shelters.slice(0, 3);
  const alerts = notifications.slice(0, 3);

  useEffect(() => {
    // Fetch user reported incidents from incidentService
    incidentService
      .getMyIncidents()
      .then(setMyIncidents)
      .catch((err) => console.error("Error loading my incidents:", err));
  }, []);

  return (
    <AppShell
      title={`Hi, ${user?.name.split(" ")[0]}`}
      actions={
        <>
          <Button asChild variant="outline" className="rounded-full"><Link to="/citizen/assistant"><MessageSquareText className="h-4 w-4 mr-1.5" />Ask AI</Link></Button>
          <Button asChild className="rounded-full shadow-glow"><Link to="/citizen/sos"><ShieldAlert className="h-4 w-4 mr-1.5" />SOS</Link></Button>
        </>
      }
    >
      <p className="text-muted-foreground -mt-1 mb-6">Your area is currently <span className="text-success font-medium">safe</span>. We're monitoring 4 advisories.</p>

      {/* Hero status */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden border-border/60 shadow-elegant relative">
          <div className="absolute inset-0 gradient-mesh opacity-40" />
          <CardContent className="p-6 relative grid md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-full bg-success/10 text-success border-success/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse mr-1.5" /> Safety score 92/100
                </Badge>
                <Badge variant="outline" className="rounded-full">{user?.location || "Mumbai · Andheri"}</Badge>
              </div>
              <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight">All clear in your neighbourhood.</h2>
              <p className="mt-2 text-muted-foreground max-w-lg text-sm">Monsoon advisory active until tomorrow 6 AM. Light flooding possible in low-lying areas. Stay alert.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button asChild variant="secondary" className="rounded-full"><Link to="/citizen/report"><AlertTriangle className="h-4 w-4 mr-1.5" />Report emergency</Link></Button>
                <Button asChild variant="outline" className="rounded-full"><Link to="/citizen/shelters"><Building2 className="h-4 w-4 mr-1.5" />Find shelter</Link></Button>
              </div>
            </div>
            <div className="rounded-2xl glass p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Today</p>
                  <p className="text-4xl font-bold tracking-tight">28°</p>
                  <p className="text-sm text-muted-foreground">Light rain · 78% humidity</p>
                </div>
                <CloudRain className="h-12 w-12 text-info" />
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
                {["12", "3", "6", "9"].map((h, i) => (
                  <div key={h} className="rounded-lg bg-card/60 p-2">
                    <div className="text-muted-foreground">{h}{i<2?"P":"A"}</div>
                    <Sun className="h-3.5 w-3.5 mx-auto my-1 text-warning" />
                    <div className="font-medium">{28 - i}°</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        <StatCard label="Safety score" value="92" sublabel="Excellent" icon={ShieldAlert} accent="success" delay={0.05} />
        <StatCard label="Active alerts" value="3" sublabel="2 weather · 1 traffic" icon={AlertTriangle} accent="warning" delay={0.1} />
        <StatCard label="Nearby shelters" value="8" sublabel="Within 5 km" icon={Building2} accent="info" delay={0.15} />
        <StatCard label="Reports filed" value={myIncidents.length.toString()} sublabel="All logged" icon={Activity} accent="primary" delay={0.2} />
      </div>

      {/* Quick actions */}
      <div className="mt-6">
        <SectionTitle title="Quick actions" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: ShieldAlert, label: "SOS Center", to: "/citizen/sos", c: "from-emergency/15 to-emergency/0 text-emergency" },
            { icon: AlertTriangle, label: "Report Emergency", to: "/citizen/report", c: "from-warning/15 to-warning/0 text-warning" },
            { icon: MessageSquareText, label: "AI Assistant", to: "/citizen/assistant", c: "from-primary/15 to-primary/0 text-primary" },
            { icon: Heart, label: "Medical Help", to: "/citizen/medical", c: "from-info/15 to-info/0 text-info" },
          ].map((a, i) => (
            <motion.div key={a.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={a.to as any} className="group block">
                <Card className="relative overflow-hidden border-border/60 hover:shadow-elegant transition">
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60", a.c)} />
                  <CardContent className="p-5 relative">
                    <a.icon className={cn("h-7 w-7", a.c.split(" ").pop())} />
                    <div className="mt-4 font-semibold">{a.label}</div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition mt-1" />
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        {/* Recent emergencies */}
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <SectionTitle title="Recent emergencies near you" action={<Button asChild size="sm" variant="ghost"><Link to="/citizen/incidents">View all</Link></Button>} />
            <div className="space-y-2">
              {myIncidents.slice(0, 4).map((i) => {
                const key = mapCategoryToKey(i.category);
                const Icon = typeIcon[key] || ShieldAlert;
                return (
                  <Link to="/citizen/incidents" key={i._id} className="block">
                    <div className="flex items-center gap-3 rounded-xl border p-3 hover:bg-accent/40 transition">
                      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", typeColor[key] || "bg-primary/10 text-primary")}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{i.title}</span>
                          <span className="text-xs text-muted-foreground hidden sm:inline">· {i.incidentNumber}</span>
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{i.address || `${i.district}, ${i.state}`} · {i.category}</div>
                      </div>
                      <div className="hidden md:flex items-center gap-2">
                        <SeverityBadge severity={i.severity} />
                        <StatusBadge status={i.status} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* AI recommendations */}
        <Card className="bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="font-semibold tracking-tight">AI recommendations</h3>
            </div>
            <ul className="space-y-3 text-sm">
              {[
                "Restock your emergency kit — last reviewed 47 days ago.",
                "Civic Center 4 is the fastest shelter from your home (1.2 km).",
                "Share your real-time location with 2 emergency contacts.",
                "Take the monsoon preparedness mini-course (5 min).",
              ].map((t, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="text-muted-foreground">{t}</span>
                </li>
              ))}
            </ul>
            <Button asChild size="sm" variant="outline" className="mt-5 w-full rounded-full"><Link to="/citizen/assistant">Open AI assistant</Link></Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        {/* Nearby shelters */}
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <SectionTitle title="Nearby shelters" action={<Button asChild size="sm" variant="ghost"><Link to="/citizen/shelters">See all</Link></Button>} />
            <div className="space-y-2">
              {near.map((s) => {
                const pct = (s.occupied / s.capacity) * 100;
                return (
                  <div key={s.id} className="rounded-xl border p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{s.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{s.address}</div>
                      </div>
                      <Badge variant="outline" className={cn(
                        s.status === "open" && "bg-success/10 text-success border-success/20",
                        s.status === "limited" && "bg-warning/10 text-warning border-warning/20",
                        s.status === "full" && "bg-emergency/10 text-emergency border-emergency/20",
                      )}>{s.status}</Badge>
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                      <span>{s.occupied}/{s.capacity} capacity</span>
                      <span><MapPin className="h-3 w-3 inline mr-0.5" />{s.distanceKm} km</span>
                    </div>
                    <Progress value={pct} className="mt-2 h-1.5" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardContent className="p-5">
            <SectionTitle title="Latest alerts" />
            <div className="space-y-3">
              {alerts.map((a) => (
                <div key={a.id} className="rounded-xl border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{a.title}</p>
                    <span className="text-[10px] text-muted-foreground">{a.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{a.body}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend chart */}
      <Card className="mt-4">
        <CardContent className="p-5">
          <SectionTitle title="Regional incident trend" />
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={analytics.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" fontSize={11} stroke="currentColor" opacity={0.5} />
                <YAxis fontSize={11} stroke="currentColor" opacity={0.5} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)" }} />
                <Line type="monotone" dataKey="reported" stroke="var(--color-primary)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="resolved" stroke="var(--color-success)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
