import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle, Truck, Building2, Users, CheckCircle2, ShieldAlert, Info } from "lucide-react";
import { notifications } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const ICONS: any = { sos: ShieldAlert, assigned: Users, dispatched: Truck, shelter: Building2, escalated: AlertTriangle, resolved: CheckCircle2, info: Info };
const TONES: any = { sos: "bg-emergency/10 text-emergency", assigned: "bg-primary/10 text-primary", dispatched: "bg-info/10 text-info", shelter: "bg-success/10 text-success", escalated: "bg-warning/10 text-warning", resolved: "bg-success/10 text-success", info: "bg-muted text-foreground" };

export const Route = createFileRoute("/volunteer/notifications")({
  head: () => ({ meta: [{ title: "Notifications — ResQNet" }] }),
  component: () => (
    <AppShell title="Notifications" actions={<Button variant="outline" className="rounded-full">Mark all read</Button>}>
      <p className="text-muted-foreground -mt-1 mb-6">{notifications.filter(n => n.unread).length} unread · {notifications.length} total</p>
      <div className="max-w-2xl space-y-2">
        {notifications.map(n => {
          const I = ICONS[n.type];
          return (
            <Card key={n.id} className={cn(n.unread && "border-primary/30")}><CardContent className="p-4 flex gap-3">
              <div className={cn("h-10 w-10 rounded-xl grid place-items-center shrink-0", TONES[n.type])}><I className="h-5 w-5"/></div>
              <div className="flex-1 min-w-0"><div className="flex items-center gap-2"><span className="font-semibold text-sm">{n.title}</span>{n.unread && <span className="h-1.5 w-1.5 rounded-full bg-primary"/>}</div><div className="text-sm text-muted-foreground mt-0.5">{n.body}</div><div className="text-xs text-muted-foreground mt-1.5">{n.time}</div></div>
            </CardContent></Card>
          );
        })}
      </div>
    </AppShell>
  ),
});
void Bell;
