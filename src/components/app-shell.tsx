import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Role } from "@/lib/mock-data";
import {
  LayoutDashboard,
  AlertTriangle,
  MapPin,
  MessageSquareText,
  Bell,
  Settings,
  LifeBuoy,
  Heart,
  FileText,
  Compass,
  Users,
  Truck,
  Radio,
  Wrench,
  BarChart3,
  Activity,
  ShieldAlert,
  Building2,
  Award,
  GraduationCap,
  Boxes,
  Shield,
  LogOut,
  ChevronLeft,
  Search,
  Sun,
  Moon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { type ReactNode, useEffect, useState } from "react";
import { Logo } from "@/components/logo";

const NAV: Record<Role, { label: string; items: { title: string; url: string; icon: any }[] }[]> = {
  citizen: [
    {
      label: "Main",
      items: [
        { title: "Dashboard", url: "/citizen", icon: LayoutDashboard },
        { title: "Report Emergency", url: "/citizen/report", icon: AlertTriangle },
        { title: "SOS Center", url: "/citizen/sos", icon: ShieldAlert },
        { title: "AI Assistant", url: "/citizen/assistant", icon: MessageSquareText },
      ],
    },
    {
      label: "Resources",
      items: [
        { title: "Shelter Locator", url: "/citizen/shelters", icon: Building2 },
        { title: "Emergency Map", url: "/citizen/map", icon: MapPin },
        { title: "Medical Help", url: "/citizen/medical", icon: Heart },
        { title: "History", url: "/citizen/history", icon: FileText },
      ],
    },
    {
      label: "Account",
      items: [
        { title: "Notifications", url: "/citizen/notifications", icon: Bell },
        { title: "Profile", url: "/citizen/profile", icon: Settings },
      ],
    },
  ],
  volunteer: [
    {
      label: "Main",
      items: [
        { title: "Dashboard", url: "/volunteer", icon: LayoutDashboard },
        { title: "Available Missions", url: "/volunteer/missions", icon: Compass },
        { title: "Active Mission", url: "/volunteer/active", icon: Activity },
      ],
    },
    {
      label: "Grow",
      items: [
        { title: "Training Center", url: "/volunteer/training", icon: GraduationCap },
        { title: "Achievements", url: "/volunteer/achievements", icon: Award },
        { title: "Resources", url: "/volunteer/resources", icon: Boxes },
      ],
    },
    {
      label: "Account",
      items: [
        { title: "Notifications", url: "/volunteer/notifications", icon: Bell },
        { title: "Profile", url: "/volunteer/profile", icon: Settings },
      ],
    },
  ],
  rescue: [
    {
      label: "Operations",
      items: [
        { title: "Command Center", url: "/rescue", icon: LayoutDashboard },
        { title: "Active Incidents", url: "/rescue/incidents", icon: AlertTriangle },
        { title: "Dispatch", url: "/rescue/dispatch", icon: Radio },
        { title: "Vehicle Tracking", url: "/rescue/vehicles", icon: Truck },
      ],
    },
    {
      label: "Manage",
      items: [
        { title: "Personnel", url: "/rescue/personnel", icon: Users },
        { title: "Resources", url: "/rescue/resources", icon: Wrench },
        { title: "Analytics", url: "/rescue/analytics", icon: BarChart3 },
      ],
    },
    { label: "Account", items: [{ title: "Profile", url: "/rescue/profile", icon: Settings }] },
  ],
  authority: [
    {
      label: "Command",
      items: [
        { title: "National Overview", url: "/authority", icon: LayoutDashboard },
        { title: "Live Monitoring", url: "/authority/monitoring", icon: Activity },
        { title: "Analytics", url: "/authority/analytics", icon: BarChart3 },
      ],
    },
    {
      label: "Manage",
      items: [
        { title: "Registration Requests", url: "/authority/requests", icon: FileText },
        { title: "Shelters", url: "/authority/shelters", icon: Building2 },
        { title: "Volunteers", url: "/authority/volunteers", icon: Users },
        { title: "Rescue Teams", url: "/authority/teams", icon: Shield },
        { title: "Resources", url: "/authority/resources", icon: Boxes },
      ],
    },
    { label: "Account", items: [{ title: "Profile", url: "/authority/profile", icon: Settings }] },
  ],
  admin: [
    {
      label: "Admin",
      items: [
        { title: "Overview", url: "/admin", icon: LayoutDashboard },
        { title: "Registration Requests", url: "/admin/requests", icon: FileText },
        { title: "Users", url: "/admin/users", icon: Users },
        { title: "System Health", url: "/admin/health", icon: Activity },
        { title: "Settings", url: "/admin/settings", icon: Settings },
      ],
    },
  ],
};

const ROLE_LABEL: Record<Role, string> = {
  citizen: "Citizen",
  volunteer: "Volunteer",
  rescue: "Rescue Team",
  authority: "Authority",
  admin: "Admin",
};

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("resqnet.theme", next ? "dark" : "light");
    } catch {
      /* ignore */
    }
  };
  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  if (!user) return null;
  const sections = NAV[user.role];

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b">
        <Link
          to="/"
          className="flex items-center gap-2.5 px-1.5 py-1 hover:opacity-85 transition cursor-pointer"
        >
          <Logo size={36} className="shrink-0 shadow-glow" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight">ResQNet</p>
              <p className="truncate text-[10px] text-muted-foreground uppercase tracking-wider">
                {ROLE_LABEL[user.role]} workspace
              </p>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {sections.map((sec) => (
          <SidebarGroup key={sec.label}>
            <SidebarGroupLabel>{sec.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sec.items.map((item) => {
                  const active =
                    pathname === item.url ||
                    (item.url !== `/${user.role}` && pathname.startsWith(item.url));
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                        <Link to={item.url} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t">
        <div className="flex items-center gap-2 px-1 py-1">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {user.avatar}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.location}</p>
            </div>
          )}
          {!collapsed && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export function AppShell({
  title,
  children,
  actions,
}: {
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user, navigate]);
  useEffect(() => {
    try {
      const t = localStorage.getItem("resqnet.theme");
      if (t === "dark") document.documentElement.classList.add("dark");
    } catch {
      /* ignore */
    }
  }, []);
  if (!user) return null;
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b glass px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search incidents, shelters, missions…"
                className="pl-9 h-9 bg-muted/40 border-0"
              />
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <Badge
              variant="outline"
              className="hidden sm:inline-flex gap-1.5 font-normal border-success/30 text-success bg-success/5"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> Live
            </Badge>
            <ThemeToggle />
            <Button asChild variant="ghost" size="icon">
              <Link to={`/${user.role}/notifications` as any}>
                <Bell className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </header>
        <main className="flex-1">
          {(title || actions) && (
            <div className="flex flex-wrap items-end justify-between gap-3 px-6 pt-6 pb-2">
              {title && <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>}
              {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
            </div>
          )}
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
