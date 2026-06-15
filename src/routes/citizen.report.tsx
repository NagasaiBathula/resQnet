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
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, MapPin, Camera, CheckCircle2, Upload, ShieldAlert, Locate } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { Map } from "@/components/map/map";
import { MapProvider, useMapController } from "@/components/map/map-provider";
import { LocationSelector } from "@/components/location-selector";
import { incidentService } from "@/services/incidentService";
import { Coordinate, DEFAULT_CENTER } from "@/lib/constants/map-defaults";

export const Route = createFileRoute("/citizen/report")({
  head: () => ({ meta: [{ title: "Report Emergency — ResQNet" }] }),
  component: ReportPageWrapper,
});

function ReportPageWrapper() {
  return (
    <MapProvider>
      <ReportPage />
    </MapProvider>
  );
}

const TYPES: { value: string; label: string }[] = [
  { value: "Flood", label: "Flood" },
  { value: "Fire", label: "Fire" },
  { value: "Medical Emergency", label: "Medical Emergency" },
  { value: "Road Accident", label: "Road Accident" },
  { value: "Landslide", label: "Landslide" },
  { value: "Earthquake", label: "Earthquake" },
  { value: "Cyclone", label: "Cyclone" },
  { value: "Building Collapse", label: "Building Collapse" },
  { value: "Missing Person", label: "Missing Person" },
  { value: "Other", label: "Other" },
];

const SEVERITIES: Severity[] = ["low", "medium", "high", "critical"];

function ReportPage() {
  const { user } = useAuth();
  const controller = useMapController();

  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<string | null>(null);
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState<Coordinate | null>(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [severity, setSeverity] = useState<Severity>("high");
  const [caseId, setCaseId] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default state/district from logged in user profile
  useEffect(() => {
    if (user) {
      setState(user.location?.split(",")[0]?.trim() || "Maharashtra");
      setDistrict(user.location?.split(",")[1]?.trim() || "Mumbai");
    }
  }, [user]);

  const total = 6;
  const progress = (step / total) * 100;

  const next = () => setStep((s) => Math.min(total, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  // Geolocation Handler
  const handleMyLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCoordinates(loc);
          controller.setUserLocation(loc);
          controller.panTo(loc, 14);
          setIsLocating(false);
        },
        (error) => {
          console.error(error);
          const fallback = DEFAULT_CENTER;
          setCoordinates(fallback);
          controller.panTo(fallback, 12);
          setIsLocating(false);
          toast.error("Could not fetch location automatically. Drop a pin on the map.");
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  const submit = async () => {
    if (!title || !desc || !category || !state || !district || !coordinates) {
      toast.error("Please fill all required steps before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await incidentService.createIncident({
        title,
        description: desc,
        category,
        severity,
        state,
        district,
        address,
        coordinates,
        attachments: [],
      });
      setCaseId(result.incidentNumber);
      setStep(total);
      toast.success(`Report submitted · ${result.incidentNumber}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit emergency report");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLucideIcon = (val: string) => {
    switch (val) {
      case "Flood":
        return typeIcon.flood;
      case "Fire":
        return typeIcon.fire;
      case "Medical Emergency":
        return typeIcon.medical;
      case "Cyclone":
        return typeIcon.cyclone;
      case "Landslide":
        return typeIcon.landslide;
      default:
        return ShieldAlert;
    }
  };

  const getBadgeColor = (val: string) => {
    switch (val) {
      case "Flood":
        return typeColor.flood;
      case "Fire":
        return typeColor.fire;
      case "Medical Emergency":
        return typeColor.medical;
      case "Cyclone":
        return typeColor.cyclone;
      case "Landslide":
        return typeColor.landslide;
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200";
    }
  };

  return (
    <AppShell title="Report emergency">
      <p className="text-muted-foreground -mt-1 mb-6">Help us coordinate relief. Universal reporting form.</p>
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
                  <p className="text-sm text-muted-foreground mt-1">Select the closest match for the incident category.</p>
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {TYPES.map((t) => {
                      const Icon = getLucideIcon(t.value);
                      const active = category === t.value;
                      return (
                        <button
                          key={t.value}
                          onClick={() => setCategory(t.value)}
                          className={cn(
                            "rounded-2xl border p-5 text-left transition hover:border-primary/40 hover:bg-accent/40 cursor-pointer",
                            active && "border-primary bg-primary/5 shadow-glow"
                          )}
                        >
                          <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center", getBadgeColor(t.value))}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="mt-3 font-medium text-sm">{t.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                  <h2 className="text-xl font-semibold tracking-tight">Where is it happening?</h2>
                  <p className="text-sm text-muted-foreground mt-1">Set jurisdiction and pin coordinates on the interactive map.</p>
                  
                  <div className="mt-4 space-y-4">
                    <LocationSelector
                      selectedState={state}
                      onStateChange={setState}
                      selectedDistrict={district}
                      onDistrictChange={setDistrict}
                    />

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <Label className="text-xs text-muted-foreground">Coordinates Pin</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleMyLocation}
                          disabled={isLocating}
                          className="h-7 text-xs rounded-full"
                        >
                          <Locate className={cn("h-3.5 w-3.5 mr-1", isLocating && "animate-spin")} />
                          {isLocating ? "Fetching..." : "Pin my location"}
                        </Button>
                      </div>
                      <div className="rounded-2xl border h-52 relative overflow-hidden bg-muted/20">
                        <Map
                          markers={
                            coordinates
                              ? [{ id: "pin", position: coordinates, type: "user", title: "Selected Location" }]
                              : []
                          }
                          className="h-full w-full"
                          onMapClick={(coord) => {
                            setCoordinates(coord);
                          }}
                        />
                      </div>
                      {coordinates && (
                        <div className="text-[10px] text-muted-foreground font-mono mt-1 text-right">
                          Lat: {coordinates.lat.toFixed(5)}° N, Lng: {coordinates.lng.toFixed(5)}° E
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="address-input">Full Address / Landmark Details</Label>
                      <Input
                        id="address-input"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Sector 12, Main Road, near Metro station..."
                        className="h-11 mt-1"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="3" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                  <h2 className="text-xl font-semibold tracking-tight">Add photos (MVP Metadata)</h2>
                  <p className="text-sm text-muted-foreground mt-1">Optional. Helps responders understand the situation on-site.</p>
                  <div className="mt-6 grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                      <button key={i} className="aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground hover:bg-accent/40 hover:border-primary/40 transition">
                        <Camera className="h-6 w-6" />
                        <span className="text-xs mt-1.5">Photo {i}</span>
                      </button>
                    ))}
                  </div>
                  <Button variant="outline" className="mt-4 rounded-full"><Upload className="h-4 w-4 mr-1.5" />Upload metadata profile</Button>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="4" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                  <h2 className="text-xl font-semibold tracking-tight">Describe the emergency</h2>
                  <p className="text-sm text-muted-foreground mt-1">Provide a brief case title and detailed log of what is happening.</p>
                  
                  <div className="mt-6 space-y-4">
                    <div>
                      <Label htmlFor="title-input">Incident Summary Title</Label>
                      <Input
                        id="title-input"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Rising flood waters in residential block..."
                        className="h-11 mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="desc-input">Detailed Description</Label>
                      <Textarea
                        id="desc-input"
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        rows={5}
                        placeholder="Specify number of people affected, urgent medical needs, hazards, road access info..."
                        className="mt-1"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 5 && (
                <motion.div key="5" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                  <h2 className="text-xl font-semibold tracking-tight">Select severity level</h2>
                  <p className="text-sm text-muted-foreground mt-1">Your reading helps command centers triage responders.</p>
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {SEVERITIES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSeverity(s)}
                        className={cn(
                          "rounded-2xl border p-5 text-left transition capitalize hover:border-primary/40 cursor-pointer",
                          severity === s && "border-primary bg-primary/5 shadow-glow"
                        )}
                      >
                        <SeverityBadge severity={s} />
                        <div className="mt-3 font-semibold text-sm capitalize">{s}</div>
                        <p className="text-[11px] text-muted-foreground mt-1">
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
                  <p className="mt-2 text-muted-foreground">
                    Case Number: <span className="font-mono font-bold text-foreground">{caseId}</span> · Status: Reported
                  </p>
                  <div className="mt-6 max-w-md mx-auto rounded-2xl border p-4 text-left bg-gradient-to-br from-primary/5 to-transparent">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Next steps</div>
                    <ul className="mt-2 space-y-2 text-xs text-muted-foreground">
                      <li>· Command center will verify details and assign resources</li>
                      <li>· You'll receive real-time updates on your incidents dashboard</li>
                      <li>· Field responders may contact you if they require direction</li>
                    </ul>
                  </div>
                  <div className="mt-7 flex flex-wrap justify-center gap-2">
                    <Button asChild className="rounded-full">
                      <Link to="/citizen/sos">
                        <ShieldAlert className="h-4 w-4 mr-1.5" />Open SOS center
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-full">
                      <Link to="/citizen">Back to dashboard</Link>
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {step < 6 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <Button variant="ghost" onClick={back} disabled={step === 1}><ArrowLeft className="h-4 w-4 mr-1.5" />Back</Button>
                {step < 5 ? (
                  <Button
                    onClick={next}
                    disabled={
                      (step === 1 && !category) ||
                      (step === 2 && (!state || !district || !coordinates))
                    }
                    className="rounded-full"
                  >
                    Continue<ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                ) : (
                  <Button
                    onClick={submit}
                    disabled={isSubmitting || !title.trim() || !desc.trim()}
                    className="rounded-full shadow-glow"
                  >
                    {isSubmitting ? "Submitting..." : "Submit report"}
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
