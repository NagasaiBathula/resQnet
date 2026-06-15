import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { incidents } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { typeIcon, typeColor, SeverityBadge, StatusBadge, SectionTitle } from "@/components/shared";
import { MapPin, Users, Truck, ArrowLeft, FileText, Radio, AlertOctagon, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/rescue/incidents/$id")({ component: IncidentDetail });
function IncidentDetail() {
  const { id } = Route.useParams();
  const i = incidents.find(x => x.id === id) ?? incidents[0];
  const Icon = typeIcon[i.type];
  return (
    <AppShell title={i.caseId} actions={
      <>
        <Button variant="outline" className="rounded-full"><Radio className="h-4 w-4 mr-1.5"/>Comms</Button>
        <Button variant="outline" className="rounded-full"><AlertOctagon className="h-4 w-4 mr-1.5"/>Escalate</Button>
        <Button className="rounded-full shadow-glow"><CheckCircle2 className="h-4 w-4 mr-1.5"/>Resolve</Button>
      </>
    }>
      <Button asChild variant="ghost" size="sm" className="-mt-2 mb-4"><Link to="/rescue/incidents"><ArrowLeft className="h-4 w-4 mr-1"/>Back to queue</Link></Button>
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2"><CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center", typeColor[i.type])}><Icon className="h-7 w-7"/></div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold tracking-tight">{i.title}</h2>
              <p className="text-sm text-muted-foreground mt-1"><MapPin className="h-3 w-3 inline mr-1"/>{i.location}</p>
              <div className="flex gap-2 mt-3"><SeverityBadge severity={i.severity}/><StatusBadge status={i.status}/></div>
            </div>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{i.description}</p>
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="rounded-xl border p-3"><div className="text-xs text-muted-foreground">Reporter</div><div className="font-medium text-sm">{i.reporter}</div></div>
            <div className="rounded-xl border p-3"><div className="text-xs text-muted-foreground">Affected</div><div className="font-medium text-sm">{i.affectedPeople} people</div></div>
            <div className="rounded-xl border p-3"><div className="text-xs text-muted-foreground">ETA</div><div className="font-medium text-sm">{i.eta ?? "—"}</div></div>
          </div>
          <div className="mt-6">
            <SectionTitle title="Activity timeline"/>
            <ol className="space-y-3">
              {[
                ["Emergency reported","Citizen filed via app",CheckCircle2],
                ["AI triage complete",`Severity ${i.severity}`,CheckCircle2],
                ["Volunteer assigned","Priya Patel responding",Users],
                ["Rescue team dispatched",`${i.assignedTeam ?? "Team Alpha-3"} en route`,Truck],
                ["On site","Operations underway",MapPin],
              ].map(([t,d,Ic]:any,idx)=>(
                <li key={idx} className="flex gap-3 items-start">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0"><Ic className="h-4 w-4"/></div>
                  <div className="flex-1"><div className="text-sm font-medium">{t}</div><div className="text-xs text-muted-foreground">{d}</div></div>
                  <span className="text-xs text-muted-foreground">{idx*4}m</span>
                </li>
              ))}
            </ol>
          </div>
        </CardContent></Card>
        <div className="space-y-4">
          <Card><CardContent className="p-5">
            <SectionTitle title="Assigned resources"/>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between"><span>{i.assignedTeam ?? "Team Alpha-3"}</span><span className="text-muted-foreground">6 units</span></li>
              <li className="flex justify-between"><span>Boats</span><span className="text-muted-foreground">2</span></li>
              <li className="flex justify-between"><span>Ambulances</span><span className="text-muted-foreground">1</span></li>
              <li className="flex justify-between"><span>Medics</span><span className="text-muted-foreground">4</span></li>
            </ul>
            <Button variant="outline" size="sm" className="mt-4 w-full rounded-full">Modify allocation</Button>
          </CardContent></Card>
          <Card><CardContent className="p-5">
            <SectionTitle title="Actions"/>
            <div className="grid gap-2">
              <Button variant="outline" className="justify-start rounded-full"><Users className="h-4 w-4 mr-2"/>Assign team</Button>
              <Button variant="outline" className="justify-start rounded-full"><FileText className="h-4 w-4 mr-2"/>Generate report</Button>
              <Button variant="outline" className="justify-start rounded-full"><AlertOctagon className="h-4 w-4 mr-2"/>Escalate to authority</Button>
            </div>
          </CardContent></Card>
        </div>
      </div>
    </AppShell>
  );
}
