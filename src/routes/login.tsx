import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { useAuth, roleHome } from "@/lib/auth";
import { demoUsers } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ShieldAlert,
  ArrowRight,
  User,
  HeartHandshake,
  Truck,
  Landmark,
  Settings,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — ResQNet" }] }),
  component: LoginPage,
});

const ROLE_META = {
  citizen: { icon: User, label: "Citizen", desc: "Report emergencies, find shelter, get AI help" },
  volunteer: {
    icon: HeartHandshake,
    label: "Volunteer",
    desc: "Accept missions and assist responders",
  },
  rescue: { icon: Truck, label: "Rescue Team", desc: "Dispatch, deploy, coordinate operations" },
  authority: { icon: Landmark, label: "Authority", desc: "National oversight and analytics" },
  admin: { icon: Settings, label: "Admin", desc: "Platform & user management" },
} as const;

function LoginPage() {
  const { login, loginAs, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("citizen@resqnet.ai");
  const [password, setPassword] = useState("demo123");

  useEffect(() => {
    if (user) {
      navigate({ to: roleHome(user.role), replace: true });
    }
  }, [user, navigate]);

  if (user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await login(email, password);
    if (!r.ok) {
      toast.error(r.error || "Login failed");
      return;
    }
    toast.success("Welcome back!");
  };

  const oneClick = async (role: keyof typeof ROLE_META) => {
    await loginAs(role);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-90" />
        <div className="relative">
          <Link to="/" className="flex items-center gap-2">
            <Logo size={36} className="shadow-glow" />
            <span className="font-semibold tracking-tight">ResQNet</span>
          </Link>
        </div>
        <div className="relative">
          <h2 className="text-4xl font-bold tracking-tight leading-tight">
            Turning chaos into <br />
            coordinated action.
          </h2>
          <p className="mt-4 text-muted-foreground max-w-md">
            One-click into any role and explore the entire disaster response platform.
          </p>
          <div className="mt-8 flex items-center gap-3 text-xs text-muted-foreground">
            <Badge
              variant="outline"
              className="rounded-full gap-1.5 bg-background/60 backdrop-blur"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> Live demo
            </Badge>
            <span>·</span>
            <span>v2.4 · Investor preview</span>
          </div>
        </div>
        <div className="relative text-xs text-muted-foreground">
          © 2026 ResQNet · All systems nominal
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col p-6 md:p-10 lg:p-12 bg-background">
        <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
          <Logo size={32} />
          <span className="font-semibold tracking-tight">ResQNet</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full"
        >
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Sign in with credentials or jump into a role.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pw">Password</Label>
              <Input
                id="pw"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
              />
            </div>
            <Button type="submit" className="w-full h-11 rounded-xl shadow-glow">
              Sign in <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </form>

          <div className="my-7 relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-xs uppercase tracking-wider text-muted-foreground">
                One-click demo
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(Object.keys(ROLE_META) as (keyof typeof ROLE_META)[]).map((r, i) => {
              const M = ROLE_META[r];
              return (
                <motion.button
                  key={r}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => oneClick(r)}
                  className="group text-left rounded-2xl border bg-card hover:bg-accent/40 hover:border-primary/40 transition p-3.5 flex items-center gap-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition">
                    <M.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold tracking-tight">{M.label}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{M.desc}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition" />
                </motion.button>
              );
            })}
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Create one
            </Link>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            By continuing you agree to our{" "}
            <a className="underline hover:text-foreground" href="#">
              Terms
            </a>{" "}
            &{" "}
            <a className="underline hover:text-foreground" href="#">
              Privacy
            </a>
            .
          </p>
        </motion.div>
      </div>
    </div>
  );
}
