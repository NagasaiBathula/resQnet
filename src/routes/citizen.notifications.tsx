import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { notifications } from "@/lib/mock-data";
import {
    AlertTriangle,
  Truck,
  Building2,
  Users,
  CheckCircle2,
  ShieldAlert,
  Info,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {} from "@/lib/auth";

const ICONS = {
  sos: ShieldAlert,
  assigned: Users,
  dispatched: Truck,
  shelter: Building2,
  escalated: AlertTriangle,
  resolved: CheckCircle2,
  info: Info,
};
const TONES = {
  sos: "bg-emergency/10 text-emergency",
  assigned: "bg-primary/10 text-primary",
  dispatched: "bg-info/10 text-info",
  shelter: "bg-success/10 text-success",
  escalated: "bg-warning/10 text-warning",
  resolved: "bg-success/10 text-success",
  info: "bg-muted text-foreground",
};

function NotificationsView() {
  return (
    <AppShell
      title="Notifications"
      actions={
        <Button variant="outline" className="rounded-full">
          Mark all read
        </Button>
      }
    >
      <p className="text-muted-foreground -mt-1 mb-6">
        {notifications.filter((n) => n.unread).length} unread · {notifications.length} total
      </p>
      <div className="max-w-2xl space-y-2">
        {notifications.map((n, i) => {
          const I = ICONS[n.type];
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card
                className={cn("border-border/60", n.unread && "border-primary/30 bg-primary/5")}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                      TONES[n.type],
                    )}
                  >
                    <I className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold">{n.title}</span>
                      {n.unread && (
                        <Badge
                          variant="outline"
                          className="bg-primary/10 text-primary border-primary/20"
                        >
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{n.time}</span>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </AppShell>
  );
}

export const Route = createFileRoute("/citizen/notifications")({
  head: () => ({ meta: [{ title: "Notifications — ResQNet" }] }),
  component: NotificationsView,
});
