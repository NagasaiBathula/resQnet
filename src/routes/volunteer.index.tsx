import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared";
import {
  Compass,
  CheckCircle,
  Activity,
  Heart,
  Award,
  ArrowRight,
  ClipboardList,
  MapPin,
    } from "lucide-react";
import { useState, useEffect } from "react";
import { incidentService } from "@/services/incidentService";
import { cn } from "@/lib/utils";
import { getStatusBadgeTone } from "@/lib/constants/incident-status";

export const Route = createFileRoute("/volunteer/")({
  head: () => ({ meta: [{ title: "Volunteer Dashboard — ResQNet" }] }),
  component: VolunteerDashboard,
});

function VolunteerDashboard() {
  const [assignedMissions, setAssignedMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    incidentService
      .getMyIncidents()
      .then((data) => {
        setAssignedMissions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading volunteer incidents:", err);
        setLoading(false);
      });
  }, []);

  const pendingMissions = assignedMissions.filter((i) => i.status === "Assigned" || i.status === "Verified" || i.status === "Reported");
  const inProgressMissions = assignedMissions.filter((i) => i.status === "In Progress");
  const completedMissions = assignedMissions.filter((i) => i.status === "Resolved");

  const totalAssigned = pendingMissions.length + inProgressMissions.length;

  return (
    <AppShell title="Volunteer Missions Portal">
      <p className="text-muted-foreground -mt-1 mb-6">
        Relief coordination dashboard. Track assigned emergencies, connect with rescue squads, and view operational updates.
      </p>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Assigned Missions"
          value={loading ? "..." : String(totalAssigned)}
          sublabel="Immediate attention"
          icon={Compass}
          accent="primary"
          delay={0}
        />
        <StatCard
          label="Active In Progress"
          value={loading ? "..." : String(inProgressMissions.length)}
          sublabel="Field activities active"
          icon={Activity}
          accent="warning"
          delay={0.05}
        />
        <StatCard
          label="Completed Missions"
          value={loading ? "..." : String(completedMissions.length)}
          sublabel="Cases closed"
          icon={CheckCircle}
          accent="success"
          delay={0.1}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6 mt-6">
        {/* Left column: Assigned Mission List */}
        <div className="space-y-6">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="p-5 border-b">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-primary" /> Active Assignments
                </span>
                <Button asChild size="sm" className="rounded-full shadow-sm text-xs">
                  <Link to="/volunteer/missions">
                    Missions Board <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-hidden divide-y">
              {loading ? (
                <div className="p-6 text-center text-xs text-muted-foreground">Syncing assignments...</div>
              ) : assignedMissions.filter(m => m.status !== "Resolved").length === 0 ? (
                <div className="p-8 text-center text-xs italic text-muted-foreground">
                  No active missions assigned to you currently. Standby.
                </div>
              ) : (
                assignedMissions.filter(m => m.status !== "Resolved").map((inc) => (
                  <div key={inc._id} className="p-4 hover:bg-accent/40 transition flex items-center justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-muted-foreground text-[10px]">
                          {inc.incidentNumber}
                        </span>
                        <Badge
                          className={cn(
                            "text-[9px] px-1.5 py-0 font-medium rounded-full capitalize",
                            getStatusBadgeTone(inc.status),
                          )}
                        >
                          {inc.status}
                        </Badge>
                      </div>
                      <div className="font-bold text-foreground">{inc.title}</div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{inc.address || `${inc.district}, ${inc.state}`}</span>
                      </div>
                    </div>
                    <Button asChild size="sm" variant="ghost" className="rounded-full text-xs">
                      <Link to="/volunteer/missions">
                        Open <ClipboardList className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Growth & Impact Card */}
        <Card className="border-border/60 shadow-sm h-fit">
          <CardHeader className="p-5 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Award className="h-4 w-4 text-warning" /> Volunteer Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center text-warning shrink-0">
                <Heart className="h-5 w-5 fill-current" />
              </div>
              <div className="text-xs">
                <div className="font-bold">Active Responder</div>
                <div className="text-muted-foreground">Certified Emergency Support</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground leading-relaxed pt-2 border-t">
              Thank you for stepping up during critical times. Complete assignments, coordinate with rescue personnel, and follow command instructions safely.
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
