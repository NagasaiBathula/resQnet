import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SectionTitle, StatCard } from "@/components/shared";
import { Award, Star, Trophy, Flame, Share2 } from "lucide-react";

const badges = [
  { name: "First Responder", desc: "Completed first mission", earned: true, rarity: "common" },
  { name: "Lifesaver", desc: "Assisted 50+ people", earned: true, rarity: "rare" },
  { name: "Marathon", desc: "10 missions in a month", earned: true, rarity: "rare" },
  { name: "Night Owl", desc: "5 missions after midnight", earned: true, rarity: "uncommon" },
  { name: "Mentor", desc: "Trained 3 new volunteers", earned: false, rarity: "epic" },
  { name: "Storm Chaser", desc: "Cyclone response specialist", earned: false, rarity: "epic" },
  { name: "Century", desc: "100 missions completed", earned: false, rarity: "legendary" },
  { name: "Multi-discipline", desc: "Active in 4+ emergency types", earned: false, rarity: "epic" },
];

const tiers = [
  { name: "Bronze", min: 0, max: 25, color: "bg-amber-700" },
  { name: "Silver", min: 25, max: 75, color: "bg-slate-400" },
  { name: "Gold", min: 75, max: 200, color: "bg-yellow-500" },
  { name: "Platinum", min: 200, max: 500, color: "bg-cyan-400" },
];

export const Route = createFileRoute("/volunteer/achievements")({
  head: () => ({ meta: [{ title: "Achievements — ResQNet" }] }),
  component: () => (
    <AppShell title="Achievements">
      <p className="text-muted-foreground -mt-1 mb-6">Your impact, badges, and progression.</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Tier"
          value="Silver"
          sublabel="42 / 75 to Gold"
          icon={Trophy}
          accent="warning"
        />
        <StatCard label="XP" value="3,420" sublabel="+180 this week" icon={Star} accent="primary" />
        <StatCard label="Streak" value="7 days" icon={Flame} accent="emergency" />
        <StatCard label="Badges" value="4 / 12" icon={Award} accent="success" />
      </div>

      <Card className="mb-4">
        <CardContent className="p-5">
          <SectionTitle title="Path to Gold" />
          <div className="flex items-center gap-3 text-sm mb-2">
            <span className="font-medium">42 missions</span>
            <span className="text-muted-foreground">of 75 required</span>
          </div>
          <Progress value={(42 / 75) * 100} className="h-2" />
          <div className="flex justify-between mt-4 text-xs text-muted-foreground">
            {tiers.map((t) => (
              <span key={t.name}>{t.name}</span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle title="Badges" />
            <Button variant="outline" size="sm" className="rounded-full">
              <Share2 className="h-4 w-4 mr-1.5" />
              Share profile
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {badges.map((b, i) => (
              <div
                key={i}
                className={
                  "rounded-2xl border p-4 text-center transition " +
                  (b.earned ? "bg-gradient-to-br from-primary/10 to-transparent" : "opacity-50")
                }
              >
                <div
                  className={
                    "mx-auto h-14 w-14 rounded-2xl grid place-items-center mb-3 " +
                    (b.earned
                      ? "gradient-primary text-white shadow-glow"
                      : "bg-muted text-muted-foreground")
                  }
                >
                  <Award className="h-7 w-7" />
                </div>
                <div className="font-semibold text-sm">{b.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{b.desc}</div>
                <Badge variant="outline" className="rounded-full mt-2 capitalize text-[10px]">
                  {b.rarity}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  ),
});
