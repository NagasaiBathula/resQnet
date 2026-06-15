import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, MapPin, Phone, Clock, CheckCircle2, Truck, Building2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/citizen/sos")({
  head: () => ({ meta: [{ title: "SOS Center — ResQNet" }] }),
  component: SOSPage,
});

function SOSPage() {
  const [active, setActive] = useState(false);
  const [stage, setStage] = useState(0); // 0..4
  const [holdProgress, setHoldProgress] = useState(0);

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setStage((s) => Math.min(4, s + 1)), 1800);
    return () => clearInterval(t);
  }, [active]);

  const trigger = () => {
    setActive(true);
    setStage(1);
    toast.success("SOS activated · Rescue notified");
  };

  const cancel = () => {
    setActive(false);
    setStage(0);
    toast.info("SOS cancelled");
  };

  const timeline = [
    {
      i: ShieldAlert,
      t: "SOS triggered",
      d: "Location captured · CC-2517 created",
      min: stage >= 1,
    },
    {
      i: CheckCircle2,
      t: "AI triage complete",
      d: "Severity: HIGH · Type: Flood",
      min: stage >= 2,
    },
    { i: Truck, t: "Rescue team dispatched", d: "Team Alpha-3 · ETA 7 min", min: stage >= 3 },
    { i: Building2, t: "Shelter assigned", d: "Civic Center 4 · 1.2 km", min: stage >= 4 },
  ];

  return (
    <AppShell title="SOS Center">
      <p className="text-muted-foreground -mt-1 mb-6">
        One tap connects you to every responder in your area.
      </p>
      <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-6 items-start">
        {/* SOS Button */}
        <Card className="overflow-hidden border-border/60 relative shadow-elegant">
          <div className="absolute inset-0 gradient-mesh opacity-40" />
          <CardContent className="relative p-8 flex flex-col items-center text-center">
            <Badge
              variant="outline"
              className={cn(
                "rounded-full mb-6",
                active
                  ? "bg-emergency/10 text-emergency border-emergency/30"
                  : "bg-success/10 text-success border-success/20",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full mr-1.5 animate-pulse",
                  active ? "bg-emergency" : "bg-success",
                )}
              />
              {active ? "SOS active" : "Standing by"}
            </Badge>

            <div className="relative my-4">
              {active && (
                <>
                  <span className="absolute inset-0 rounded-full bg-emergency/30 animate-pulse-ring" />
                  <span
                    className="absolute inset-0 rounded-full bg-emergency/20 animate-pulse-ring"
                    style={{ animationDelay: "0.6s" }}
                  />
                </>
              )}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={active ? cancel : trigger}
                className={cn(
                  "relative h-48 w-48 md:h-56 md:w-56 rounded-full text-white font-bold text-2xl tracking-wide shadow-glow transition",
                  active ? "gradient-emergency" : "gradient-emergency",
                )}
              >
                {active ? "CANCEL SOS" : "TAP SOS"}
              </motion.button>
            </div>

            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              {active
                ? "Help is on the way. Stay where you are if safe to do so."
                : "Press once to send your location and request immediate help."}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button variant="outline" className="rounded-full">
                <Phone className="h-4 w-4 mr-1.5" />
                Call 112
              </Button>
              <Button variant="outline" className="rounded-full">
                <MapPin className="h-4 w-4 mr-1.5" />
                Share location
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card className="shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold tracking-tight">Response timeline</h3>
              {active && (
                <Badge className="rounded-full bg-emergency/10 text-emergency border-0">
                  CC-2517
                </Badge>
              )}
            </div>

            {!active ? (
              <div className="mt-8 text-center text-sm text-muted-foreground py-12 border-2 border-dashed rounded-2xl">
                No active SOS. Your status appears here once activated.
              </div>
            ) : (
              <ol className="mt-6 space-y-4">
                {timeline.map((t, i) => (
                  <AnimatePresence key={i}>
                    {t.min && (
                      <motion.li
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-3"
                      >
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 rounded-full items-center justify-center",
                            i === stage - 1
                              ? "bg-primary text-primary-foreground shadow-glow"
                              : "bg-success/10 text-success",
                          )}
                        >
                          <t.i className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{t.t}</div>
                          <div className="text-xs text-muted-foreground">{t.d}</div>
                        </div>
                        <span className="ml-auto text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3 inline mr-0.5" /> {i + 1}m
                        </span>
                      </motion.li>
                    )}
                  </AnimatePresence>
                ))}
              </ol>
            )}

            {active && stage >= 3 && (
              <div className="mt-6 rounded-2xl border p-4 bg-gradient-to-br from-primary/5 to-transparent">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      Team en route
                    </div>
                    <div className="font-semibold mt-0.5">Team Alpha-3 · Boat & medics</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold tracking-tight">7m</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      ETA
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
