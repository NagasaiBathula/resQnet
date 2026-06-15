import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SectionTitle } from "@/components/shared";
import { useAuth } from "@/lib/auth";
import { Shield, Bell, Eye, Palette, Accessibility, KeyRound, Save } from "lucide-react";
import { useState } from "react";

const TABS = [
  { id: "profile", label: "Profile", icon: Shield },
  { id: "security", label: "Security", icon: KeyRound },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Eye },
  { id: "accessibility", label: "Accessibility", icon: Accessibility },
  { id: "appearance", label: "Appearance", icon: Palette },
];

export function ProfileSettings({ role, title }: { role: string; title?: string }) {
  const { user } = useAuth();
  const [tab, setTab] = useState("profile");
  if (!user) return null;
  return (
    <AppShell title={title ?? "Profile & settings"} actions={<Button className="rounded-full shadow-glow"><Save className="h-4 w-4 mr-1.5"/>Save changes</Button>}>
      <p className="text-muted-foreground -mt-1 mb-6">Manage your account, security, and preferences for the {role} workspace.</p>
      <div className="grid lg:grid-cols-[240px_1fr] gap-4">
        <Card className="h-fit">
          <CardContent className="p-3">
            <div className="flex items-center gap-3 p-3 mb-2">
              <Avatar className="h-12 w-12"><AvatarFallback className="bg-primary/10 text-primary font-semibold">{user.avatar}</AvatarFallback></Avatar>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{user.name}</div>
                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
              </div>
            </div>
            <div className="space-y-0.5">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} className={"w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition " + (tab === t.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-accent/50 text-muted-foreground")}>
                  <t.icon className="h-4 w-4"/>{t.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardContent className="p-6">
            {tab === "profile" && (
              <>
                <SectionTitle title="Personal information"/>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>Full name</Label><Input defaultValue={user.name}/></div>
                  <div className="space-y-1.5"><Label>Email</Label><Input defaultValue={user.email}/></div>
                  <div className="space-y-1.5"><Label>Phone</Label><Input defaultValue="+91 98800 12340"/></div>
                  <div className="space-y-1.5"><Label>Location</Label><Input defaultValue={user.location}/></div>
                  <div className="space-y-1.5 sm:col-span-2"><Label>Bio</Label><Input defaultValue="Coordinating response operations across the western region."/></div>
                </div>
                <div className="mt-8"><SectionTitle title="Role & access"/>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="rounded-full capitalize">{user.role}</Badge>
                    <Badge variant="outline" className="rounded-full">Verified</Badge>
                    <Badge variant="outline" className="rounded-full">2FA enabled</Badge>
                  </div>
                </div>
              </>
            )}
            {tab === "security" && (
              <>
                <SectionTitle title="Security"/>
                <div className="space-y-4 max-w-md">
                  <div className="space-y-1.5"><Label>Current password</Label><Input type="password" defaultValue="••••••••"/></div>
                  <div className="space-y-1.5"><Label>New password</Label><Input type="password"/></div>
                  <div className="space-y-1.5"><Label>Confirm new password</Label><Input type="password"/></div>
                </div>
                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between"><div><div className="font-medium text-sm">Two-factor authentication</div><div className="text-xs text-muted-foreground">Require a code from your authenticator app.</div></div><Switch defaultChecked/></div>
                  <div className="flex items-center justify-between"><div><div className="font-medium text-sm">Biometric sign in</div><div className="text-xs text-muted-foreground">Face ID / Touch ID on supported devices.</div></div><Switch defaultChecked/></div>
                  <div className="flex items-center justify-between"><div><div className="font-medium text-sm">Active sessions alerts</div><div className="text-xs text-muted-foreground">Email when a new device signs in.</div></div><Switch defaultChecked/></div>
                </div>
              </>
            )}
            {tab === "notifications" && (
              <>
                <SectionTitle title="Notification preferences"/>
                <div className="space-y-4">
                  {["Critical SOS alerts","Dispatch updates","Shelter availability","Weekly performance digest","Team mentions","Training reminders"].map((n,i) => (
                    <div key={n} className="flex items-center justify-between"><div><div className="font-medium text-sm">{n}</div><div className="text-xs text-muted-foreground">Push · Email · SMS</div></div><Switch defaultChecked={i < 4}/></div>
                  ))}
                </div>
              </>
            )}
            {tab === "privacy" && (
              <>
                <SectionTitle title="Privacy"/>
                <div className="space-y-4">
                  {["Share location with rescue teams","Allow contact lookup by case workers","Anonymize my data in analytics","Allow research partner access"].map((p,i) => (
                    <div key={p} className="flex items-center justify-between"><div className="font-medium text-sm">{p}</div><Switch defaultChecked={i < 2}/></div>
                  ))}
                </div>
              </>
            )}
            {tab === "accessibility" && (
              <>
                <SectionTitle title="Accessibility"/>
                <div className="space-y-4">
                  {["Larger text","Reduce motion","High-contrast mode","Voice-over emergency alerts","Screen reader optimization"].map((p,i) => (
                    <div key={p} className="flex items-center justify-between"><div className="font-medium text-sm">{p}</div><Switch defaultChecked={i === 3}/></div>
                  ))}
                </div>
              </>
            )}
            {tab === "appearance" && (
              <>
                <SectionTitle title="Appearance"/>
                <div className="grid grid-cols-3 gap-3 max-w-md">
                  {["Light","Dark","System"].map((m, i) => (
                    <button key={m} className={"rounded-xl border p-4 text-sm font-medium hover:border-primary " + (i === 0 ? "border-primary bg-primary/5" : "")}>{m}</button>
                  ))}
                </div>
                <div className="mt-6 space-y-4 max-w-md">
                  <div className="flex items-center justify-between"><div className="font-medium text-sm">Compact density</div><Switch/></div>
                  <div className="flex items-center justify-between"><div className="font-medium text-sm">Show glass effects</div><Switch defaultChecked/></div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

export const Route = createFileRoute("/rescue/profile")({
  head: () => ({ meta: [{ title: "Profile — ResQNet" }] }),
  component: () => <ProfileSettings role="rescue" />,
});
