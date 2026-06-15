import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SectionTitle, StatCard } from "@/components/shared";
import { Activity, MapPin, Clock, CheckCircle2, MessageSquareText, Navigation, Phone, Users } from "lucide-react";

const steps = [
  { t: "Mission accepted", d: "12:04 PM · You joined the team", done: true },
  { t: "Arrived on site", d: "12:38 PM · Sector 12, Mumbai", done: true },
  { t: "Distributing supplies", d: "Currently · 84 / 150 families served", done: false, current: true },
  { t: "Coordinate evacuation", d: "Up next", done: false },
  { t: "Mission close-out", d: "Final report & debrief", done: false },
];

export const Route = createFileRoute("/volunteer/active")({
  head: () => ({ meta: [{ title: "Active Mission — ResQNet" }] }),
  component: () => (
    <AppShell title="Active mission" actions={
      <>
        <Button variant="outline" className="rounded-full"><Phone className="h-4 w-4 mr-1.5"/>Call lead</Button>
        <Button className="rounded-full shadow-glow"><CheckCircle2 className="h-4 w-4 mr-1.5"/>Mark step done</Button>
      </>
    }>
      <p className="text-muted-foreground -mt-1 mb-6">Flood relief · Sector 12, Mumbai · Team Alpha-3</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Elapsed" value="2h 14m" icon={Clock} accent="primary" />
        <StatCard label="Distance" value="1.2 km" sublabel="from base" icon={MapPin} accent="info" />
        <StatCard label="Team online" value="6 / 8" icon={Users} accent="success" />
        <StatCard label="Progress" value="56%" sublabel="84 of 150 families" icon={Activity} accent="warning" />
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-4">
        <Card className="shadow-elegant"><CardContent className="p-5">
          <SectionTitle title="Live timeline"/>
          <ol className="space-y-4">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <div className={"h-9 w-9 rounded-full grid place-items-center shrink-0 " + (s.done ? "bg-success/15 text-success" : s.current ? "bg-primary text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground")}>
                  {s.done ? <CheckCircle2 className="h-4 w-4"/> : <span className="text-xs font-semibold">{i+1}</span>}
                </div>
                <div className="flex-1 pt-1">
                  <div className="text-sm font-medium">{s.t}</div>
                  <div className="text-xs text-muted-foreground">{s.d}</div>
                  {s.current && <Progress value={56} className="mt-3 h-1.5 max-w-sm"/>}
                </div>
                {s.current && <Badge className="rounded-full bg-primary/10 text-primary border-0">in progress</Badge>}
              </li>
            ))}
          </ol>
        </CardContent></Card>

        <div className="space-y-4">
          <Card><CardContent className="p-5">
            <SectionTitle title="Team channel"/>
            <ul className="space-y-3 text-sm">
              {[
                { n: "Cmdr. Mehta", t: "Reroute next truck to gate B.", time: "1m" },
                { n: "Priya P.", t: "Medical tent set up.", time: "8m" },
                { n: "You", t: "On the way with supplies.", time: "11m" },
              ].map((m,i) => (
                <li key={i} className="flex gap-2 items-start"><div className="h-7 w-7 rounded-full bg-primary/10 text-primary grid place-items-center text-[10px] font-semibold">{m.n.split(" ").map(x=>x[0]).join("")}</div><div className="flex-1"><div className="text-xs"><span className="font-medium">{m.n}</span> · {m.time}</div><div>{m.t}</div></div></li>
              ))}
            </ul>
            <Button variant="outline" size="sm" className="w-full mt-4 rounded-full"><MessageSquareText className="h-4 w-4 mr-1.5"/>Open chat</Button>
          </CardContent></Card>
          <Card><CardContent className="p-5">
            <SectionTitle title="Navigate"/>
            <div className="rounded-2xl border bg-gradient-to-br from-primary/5 to-transparent p-5 text-center">
              <div className="text-3xl font-bold tracking-tight">1.2 km</div>
              <div className="text-xs text-muted-foreground mt-1">to next checkpoint · ETA 4 min</div>
              <Button className="mt-4 rounded-full shadow-glow"><Navigation className="h-4 w-4 mr-1.5"/>Open directions</Button>
            </div>
          </CardContent></Card>
        </div>
      </div>
    </AppShell>
  ),
});
