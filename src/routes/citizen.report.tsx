import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { typeIcon, typeColor, SeverityBadge } from "@/components/shared";
import { Progress } from "@/components/ui/progress";
import { EmergencyType, Severity } from "@/lib/mock-data";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, MapPin, Camera, CheckCircle2, Upload, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/citizen/report")({
  head: () => ({ meta: [{ title: "Report Emergency — ResQNet" }] }),
  component: ReportPage,
});

const TYPES: EmergencyType[] = ["flood", "cyclone", "earthquake", "fire", "landslide", "medical"];
const SEVERITIES: Severity[] = ["low", "medium", "high", "critical"];

function ReportPage() {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<EmergencyType | null>(null);
  const [location, setLocation] = useState("Andheri West, Mumbai");
  const [desc, setDesc] = useState("");
  const [severity, setSeverity] = useState<Severity>("high");
  const [caseId, setCaseId] = useState("");

  const total = 6;
  const progress = (step / total) * 100;

  const next = () => setStep(s => Math.min(total, s + 1));
  const back = () => setStep(s => Math.max(1, s - 1));
  const submit = () => {
    const id = `CC-${2500 + Math.floor(Math.random() * 200)}`;
    setCaseId(id);
    setStep(total);
    toast.success(`Report submitted · ${id}`);
  };

  return (
    <AppShell title="Report emergency">
      <p className="text-muted-foreground -mt-1 mb-6">Help us help you. Takes under a minute.</p>
      <div className="max-w-3xl mx-auto">
        <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>Step {Math.min(step, total - 1)} of {total - 1}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-1.5 mb-6" />

        <Card className="shadow-elegant border-border/60 overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="1" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                  <h2 className="text-xl font-semibold tracking-tight">What kind of emergency?</h2>
                  <p className="text-sm text-muted-foreground mt-1">Select the closest match. Our AI refines this automatically.</p>
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {TYPES.map(t => {
                      const Icon = typeIcon[t];
                      const active = type === t;
                      return (
                        <button key={t} onClick={() => setType(t)}
                          className={cn("rounded-2xl border p-5 text-left transition hover:border-primary/40 hover:bg-accent/40",
                            active && "border-primary bg-primary/5 shadow-glow")}>
                          <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center", typeColor[t])}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="mt-3 font-medium capitalize">{t}</div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
              {step === 2 && (
                <motion.div key="2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                  <h2 className="text-xl font-semibold tracking-tight">Where is it happening?</h2>
                  <p className="text-sm text-muted-foreground mt-1">We've detected your location. Adjust if needed.</p>
                  <div className="mt-6 space-y-3">
                    <div className="rounded-2xl border h-48 relative overflow-hidden bg-muted/40">
                      <div className="absolute inset-0 gradient-mesh opacity-50" />
                      <div className="absolute inset-0 grid place-items-center">
                        <div className="text-center">
                          <div className="relative inline-flex">
                            <MapPin className="h-8 w-8 text-emergency" />
                            <span className="absolute inset-0 rounded-full bg-emergency/30 animate-pulse-ring" />
                          </div>
                          <p className="mt-2 text-sm font-medium">{location}</p>
                          <p className="text-xs text-muted-foreground">19.1136° N, 72.8697° E</p>
                        </div>
                      </div>
                    </div>
                    <Label>Address</Label>
                    <Input value={location} onChange={e => setLocation(e.target.value)} className="h-11" />
                  </div>
                </motion.div>
              )}
              {step === 3 && (
                <motion.div key="3" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                  <h2 className="text-xl font-semibold tracking-tight">Add photos</h2>
                  <p className="text-sm text-muted-foreground mt-1">Optional. Helps rescue teams understand the scene.</p>
                  <div className="mt-6 grid grid-cols-3 gap-3">
                    {[1, 2, 3].map(i => (
                      <button key={i} className="aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground hover:bg-accent/40 hover:border-primary/40 transition">
                        <Camera className="h-6 w-6" />
                        <span className="text-xs mt-1.5">Photo {i}</span>
                      </button>
                    ))}
                  </div>
                  <Button variant="outline" className="mt-4 rounded-full"><Upload className="h-4 w-4 mr-1.5" />Upload from device</Button>
                </motion.div>
              )}
              {step === 4 && (
                <motion.div key="4" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                  <h2 className="text-xl font-semibold tracking-tight">Describe what you see</h2>
                  <p className="text-sm text-muted-foreground mt-1">Any detail helps — number of people, hazards, access info.</p>
                  <Textarea value={desc} onChange={e => setDesc(e.target.value)} rows={6} className="mt-5"
                    placeholder="Water rising in basement parking; 4 vehicles affected; 2 elderly residents need assistance reaching upper floors." />
                </motion.div>
              )}
              {step === 5 && (
                <motion.div key="5" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                  <h2 className="text-xl font-semibold tracking-tight">How severe is it?</h2>
                  <p className="text-sm text-muted-foreground mt-1">AI will refine, but your read helps us prioritize.</p>
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {SEVERITIES.map(s => (
                      <button key={s} onClick={() => setSeverity(s)}
                        className={cn("rounded-2xl border p-5 text-left transition capitalize hover:border-primary/40",
                          severity === s && "border-primary bg-primary/5 shadow-glow")}>
                        <SeverityBadge severity={s} />
                        <div className="mt-3 font-medium">{s}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {s === "low" && "Minor, no immediate risk"}
                          {s === "medium" && "Concerning, monitor closely"}
                          {s === "high" && "Urgent response needed"}
                          {s === "critical" && "Life-threatening, dispatch now"}
                        </p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
              {step === 6 && (
                <motion.div key="6" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                  <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
                    className="mx-auto h-16 w-16 rounded-full bg-success/15 grid place-items-center">
                    <CheckCircle2 className="h-9 w-9 text-success" />
                  </motion.div>
                  <h2 className="mt-5 text-2xl font-bold tracking-tight">Report submitted</h2>
                  <p className="mt-2 text-muted-foreground">Case <span className="font-mono font-semibold text-foreground">{caseId}</span> · AI triage in progress</p>
                  <div className="mt-6 max-w-md mx-auto rounded-2xl border p-4 text-left bg-gradient-to-br from-primary/5 to-transparent">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Next steps</div>
                    <ul className="mt-2 space-y-2 text-sm">
                      <li>· Rescue team will be assigned within 3 minutes</li>
                      <li>· You'll receive live updates via notifications</li>
                      <li>· A volunteer may contact you for on-ground info</li>
                    </ul>
                  </div>
                  <div className="mt-7 flex flex-wrap justify-center gap-2">
                    <Button asChild className="rounded-full"><Link to="/citizen/sos"><ShieldAlert className="h-4 w-4 mr-1.5" />Open SOS center</Link></Button>
                    <Button asChild variant="outline" className="rounded-full"><Link to="/citizen">Back to dashboard</Link></Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {step < 6 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <Button variant="ghost" onClick={back} disabled={step === 1}><ArrowLeft className="h-4 w-4 mr-1.5" />Back</Button>
                {step < 5 ? (
                  <Button onClick={next} disabled={step === 1 && !type} className="rounded-full">Continue<ArrowRight className="h-4 w-4 ml-1.5" /></Button>
                ) : (
                  <Button onClick={submit} className="rounded-full shadow-glow">Submit report<ArrowRight className="h-4 w-4 ml-1.5" /></Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
