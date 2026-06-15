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
import { Shield, Bell, Eye, Palette, Accessibility, KeyRound, Save, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TABS = [
  { id: "profile", label: "Profile", icon: Shield },
  { id: "security", label: "Security", icon: KeyRound },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Eye },
  { id: "accessibility", label: "Accessibility", icon: Accessibility },
  { id: "appearance", label: "Appearance", icon: Palette },
];

export function ProfileSettings({ role, title }: { role: string; title?: string }) {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("profile");
  const [activeTheme, setActiveTheme] = useState("light");
  const [settings, setSettings] = useState<Record<string, boolean>>({});

  // Initialize theme and settings from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedTheme = localStorage.getItem("resqnet.theme") || "light";
    setActiveTheme(savedTheme);

    const defaults = {
      // security
      twoFactor: true,
      biometric: true,
      sessionAlerts: true,
      // notifications
      sosAlerts: true,
      dispatchUpdates: true,
      shelterAvailability: true,
      performanceDigest: true,
      teamMentions: false,
      trainingReminders: false,
      // privacy
      shareLocation: true,
      contactLookup: true,
      anonymizeData: false,
      partnerAccess: false,
      // accessibility
      largerText: false,
      reduceMotion: false,
      highContrast: false,
      voiceAlerts: true,
      screenReader: false,
      // appearance
      compactDensity: false,
      glassEffects: true,
    };

    const loaded: Record<string, boolean> = {};
    Object.keys(defaults).forEach((key) => {
      const stored = localStorage.getItem(`resqnet.settings.${key}`);
      loaded[key] = stored !== null ? stored === "true" : defaults[key as keyof typeof defaults];
    });

    setSettings(loaded);

    // Apply startup side effects
    if (loaded.largerText) {
      document.documentElement.style.fontSize = "18px";
    }
    if (loaded.highContrast) {
      document.documentElement.classList.add("high-contrast");
    }
    if (loaded.compactDensity) {
      document.documentElement.classList.add("density-compact");
    }
  }, []);

  if (!user) return null;

  const changeTheme = (mode: string) => {
    if (typeof window === "undefined") return;

    localStorage.setItem("resqnet.theme", mode);
    setActiveTheme(mode);

    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else if (mode === "light") {
      document.documentElement.classList.remove("dark");
    } else if (mode === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", isDark);
    }
    toast.success(`Theme updated to ${mode}`);
  };

  const updateSetting = (key: string, val: boolean) => {
    if (typeof window === "undefined") return;

    localStorage.setItem(`resqnet.settings.${key}`, String(val));
    setSettings((prev) => ({ ...prev, [key]: val }));

    // Apply UI side effects
    if (key === "largerText") {
      document.documentElement.style.fontSize = val ? "18px" : "";
    }
    if (key === "highContrast") {
      document.documentElement.classList.toggle("high-contrast", val);
    }
    if (key === "compactDensity") {
      document.documentElement.classList.toggle("density-compact", val);
    }
    toast.success("Preference updated");
  };

  const handleSaveChanges = () => {
    toast.success("Profile changes saved successfully!");
  };

  const NOTIFICATION_LABELS = [
    { label: "Critical SOS alerts", key: "sosAlerts" },
    { label: "Dispatch updates", key: "dispatchUpdates" },
    { label: "Shelter availability", key: "shelterAvailability" },
    { label: "Weekly performance digest", key: "performanceDigest" },
    { label: "Team mentions", key: "teamMentions" },
    { label: "Training reminders", key: "trainingReminders" },
  ];

  const PRIVACY_LABELS = [
    { label: "Share location with rescue teams", key: "shareLocation" },
    { label: "Allow contact lookup by case workers", key: "contactLookup" },
    { label: "Anonymize my data in analytics", key: "anonymizeData" },
    { label: "Allow research partner access", key: "partnerAccess" },
  ];

  const ACCESSIBILITY_LABELS = [
    { label: "Larger text", key: "largerText" },
    { label: "Reduce motion", key: "reduceMotion" },
    { label: "High-contrast mode", key: "highContrast" },
    { label: "Voice-over emergency alerts", key: "voiceAlerts" },
    { label: "Screen reader optimization", key: "screenReader" },
  ];

  return (
    <AppShell
      title={title ?? "Profile & settings"}
      actions={
        <Button onClick={handleSaveChanges} className="rounded-full shadow-glow">
          <Save className="h-4 w-4 mr-1.5" />Save changes
        </Button>
      }
    >
      <p className="text-muted-foreground -mt-1 mb-6">
        Manage your account, security, and preferences for the {role} workspace.
      </p>
      
      <div className="grid lg:grid-cols-[240px_1fr] gap-4">
        {/* Sidebar Nav */}
        <Card className="h-fit">
          <CardContent className="p-3">
            <div className="flex items-center gap-3 p-3 mb-2">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {user.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{user.name}</div>
                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
              </div>
            </div>
            <div className="space-y-0.5">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition cursor-pointer text-left",
                    tab === t.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-accent/50 text-muted-foreground"
                  )}
                >
                  <t.icon className="h-4 w-4" />{t.label}
                </button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border/40">
              <button
                onClick={() => {
                  logout();
                  window.location.href = "/login";
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-emergency hover:bg-emergency/10 hover:text-emergency font-medium transition cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Logout Account
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Content */}
        <Card className="shadow-elegant">
          <CardContent className="p-6">
            {tab === "profile" && (
              <>
                <SectionTitle title="Personal information" />
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>Full name</Label><Input defaultValue={user.name} /></div>
                  <div className="space-y-1.5"><Label>Email</Label><Input defaultValue={user.email} /></div>
                  <div className="space-y-1.5"><Label>Phone</Label><Input defaultValue="+91 98800 12340" /></div>
                  <div className="space-y-1.5"><Label>Location</Label><Input defaultValue={user.location} /></div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Bio</Label>
                    <Input defaultValue="Coordinating relief operations across the regional sector." />
                  </div>
                </div>
                <div className="mt-8">
                  <SectionTitle title="Role & access" />
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
                <SectionTitle title="Security" />
                <div className="space-y-4 max-w-md">
                  <div className="space-y-1.5"><Label>Current password</Label><Input type="password" defaultValue="••••••••" /></div>
                  <div className="space-y-1.5"><Label>New password</Label><Input type="password" /></div>
                  <div className="space-y-1.5"><Label>Confirm new password</Label><Input type="password" /></div>
                </div>
                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">Two-factor authentication</div>
                      <div className="text-xs text-muted-foreground">Require a code from your authenticator app.</div>
                    </div>
                    <Switch
                      checked={!!settings.twoFactor}
                      onCheckedChange={(checked) => updateSetting("twoFactor", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">Biometric sign in</div>
                      <div className="text-xs text-muted-foreground">Face ID / Touch ID on supported devices.</div>
                    </div>
                    <Switch
                      checked={!!settings.biometric}
                      onCheckedChange={(checked) => updateSetting("biometric", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">Active sessions alerts</div>
                      <div className="text-xs text-muted-foreground">Email when a new device signs in.</div>
                    </div>
                    <Switch
                      checked={!!settings.sessionAlerts}
                      onCheckedChange={(checked) => updateSetting("sessionAlerts", checked)}
                    />
                  </div>
                </div>
              </>
            )}

            {tab === "notifications" && (
              <>
                <SectionTitle title="Notification preferences" />
                <div className="space-y-4">
                  {NOTIFICATION_LABELS.map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{item.label}</div>
                        <div className="text-xs text-muted-foreground">Push · Email · SMS</div>
                      </div>
                      <Switch
                        checked={!!settings[item.key]}
                        onCheckedChange={(checked) => updateSetting(item.key, checked)}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "privacy" && (
              <>
                <SectionTitle title="Privacy" />
                <div className="space-y-4">
                  {PRIVACY_LABELS.map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div className="font-medium text-sm">{item.label}</div>
                      <Switch
                        checked={!!settings[item.key]}
                        onCheckedChange={(checked) => updateSetting(item.key, checked)}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "accessibility" && (
              <>
                <SectionTitle title="Accessibility" />
                <div className="space-y-4">
                  {ACCESSIBILITY_LABELS.map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div className="font-medium text-sm">{item.label}</div>
                      <Switch
                        checked={!!settings[item.key]}
                        onCheckedChange={(checked) => updateSetting(item.key, checked)}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === "appearance" && (
              <>
                <SectionTitle title="Appearance" />
                <div className="grid grid-cols-3 gap-3 max-w-md">
                  {["Light", "Dark", "System"].map((m) => {
                    const mode = m.toLowerCase();
                    const active = activeTheme === mode;
                    return (
                      <button
                        key={m}
                        onClick={() => changeTheme(mode)}
                        className={cn(
                          "rounded-xl border p-4 text-sm font-medium hover:border-primary transition cursor-pointer",
                          active ? "border-primary bg-primary/5 text-primary" : "border-border"
                        )}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-6 space-y-4 max-w-md">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">Compact density</div>
                    <Switch
                      checked={!!settings.compactDensity}
                      onCheckedChange={(checked) => updateSetting("compactDensity", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">Show glass effects</div>
                    <Switch
                      checked={!!settings.glassEffects}
                      onCheckedChange={(checked) => updateSetting("glassEffects", checked)}
                    />
                  </div>
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
