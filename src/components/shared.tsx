import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Severity, IncidentStatus, EmergencyType } from "@/lib/mock-data";
import { Droplets, Wind, Mountain, Flame, Layers, Heart } from "lucide-react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export const typeIcon: Record<EmergencyType, any> = {
  flood: Droplets, cyclone: Wind, earthquake: Mountain, fire: Flame, landslide: Layers, medical: Heart,
};

export const typeColor: Record<EmergencyType, string> = {
  flood: "text-info bg-info/10", cyclone: "text-primary bg-primary/10",
  earthquake: "text-warning bg-warning/10", fire: "text-emergency bg-emergency/10",
  landslide: "text-warning bg-warning/10", medical: "text-emergency bg-emergency/10",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const map = {
    low: "bg-success/10 text-success border-success/20",
    medium: "bg-info/10 text-info border-info/20",
    high: "bg-warning/10 text-warning border-warning/20",
    critical: "bg-emergency/10 text-emergency border-emergency/20",
  };
  return <Badge variant="outline" className={cn("capitalize font-medium", map[severity])}>{severity}</Badge>;
}

export function StatusBadge({ status }: { status: IncidentStatus }) {
  const map: Record<IncidentStatus, string> = {
    reported: "bg-muted text-foreground",
    triaged: "bg-info/10 text-info",
    dispatched: "bg-primary/10 text-primary",
    "en-route": "bg-warning/10 text-warning",
    "on-site": "bg-warning/10 text-warning",
    resolved: "bg-success/10 text-success",
    escalated: "bg-emergency/10 text-emergency",
  };
  return <Badge className={cn("capitalize font-medium border-0", map[status])}>{status.replace("-", " ")}</Badge>;
}

export function StatCard({
  label, value, sublabel, icon: Icon, accent = "primary", delay = 0,
}: {
  label: string; value: ReactNode; sublabel?: ReactNode;
  icon?: any; accent?: "primary" | "emergency" | "success" | "warning" | "info"; delay?: number;
}) {
  const accents = {
    primary: "from-primary/10 to-primary/0 text-primary",
    emergency: "from-emergency/10 to-emergency/0 text-emergency",
    success: "from-success/10 to-success/0 text-success",
    warning: "from-warning/10 to-warning/0 text-warning",
    info: "from-info/10 to-info/0 text-info",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="overflow-hidden border-border/60 shadow-elegant relative">
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50 pointer-events-none", accents[accent])} />
        <CardContent className="p-5 relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
              <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
              {sublabel && <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>}
            </div>
            {Icon && (
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-card/80 backdrop-blur", accents[accent].split(" ").pop())}>
                <Icon className="h-5 w-5" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-3">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {action}
    </div>
  );
}
