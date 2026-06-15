import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  ShieldAlert, ArrowRight, Activity, Users, Building2, Radio, Sparkles,
  Droplets, Wind, Flame, Heart, Mountain, Layers, MessageSquareText, MapPin,
  BarChart3, Star, CheckCircle2, Globe2
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ResQNet — Turning Chaos Into Coordinated Action" },
      { name: "description", content: "AI-powered disaster response platform connecting citizens, volunteers, rescue teams, and authorities in real time." },
    ],
  }),
  component: Landing,
});

function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-6xl px-4 mt-4">
        <div className="glass-strong rounded-2xl flex items-center justify-between px-4 py-2.5 shadow-elegant">
          <Link to="/" className="flex items-center gap-2">
            <Logo size={32} />
            <span className="font-semibold tracking-tight">ResQNet <span className="text-primary">AI</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">Features</a>
            <a href="#how" className="hover:text-foreground transition">How it works</a>
            <a href="#network" className="hover:text-foreground transition">Network</a>
            <a href="#testimonials" className="hover:text-foreground transition">Stories</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/login">Sign in</Link></Button>
            <Button asChild size="sm" className="rounded-full"><Link to="/login">Launch demo <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link></Button>
          </div>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative pt-36 pb-24 overflow-hidden">
      <div className="absolute inset-0 gradient-mesh opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Badge variant="outline" className="rounded-full glass border-border/60 px-3 py-1 gap-1.5 mb-6">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-xs">AI-powered disaster response · v2.4</span>
          </Badge>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]"
        >
          Turning chaos into<br />
          <span className="bg-gradient-to-r from-primary via-info to-emergency bg-clip-text text-transparent">coordinated action.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mt-6 mx-auto max-w-2xl text-lg text-muted-foreground"
        >
          The first end-to-end emergency operating system that connects citizens, volunteers, rescue teams, and authorities — orchestrated by AI in real time.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Button asChild size="lg" className="rounded-full h-12 px-6 shadow-glow">
            <Link to="/login">Open live demo <ArrowRight className="h-4 w-4 ml-2" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full h-12 px-6">
            <a href="#how">See how it works</a>
          </Button>
        </motion.div>

        {/* Floating preview card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}
          className="mt-16 mx-auto max-w-4xl"
        >
          <div className="relative rounded-3xl glass-strong shadow-elegant p-2 border">
            <div className="rounded-2xl bg-card overflow-hidden border">
              <div className="h-9 flex items-center gap-1.5 px-4 border-b bg-muted/40">
                <span className="h-2.5 w-2.5 rounded-full bg-emergency/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
                <span className="ml-3 text-xs text-muted-foreground">ResQNet · Command Center</span>
              </div>
              <div className="grid md:grid-cols-3 gap-3 p-4">
                {[
                  { label: "Active incidents", value: "247", icon: Activity, tone: "text-emergency" },
                  { label: "Volunteers online", value: "1,842", icon: Users, tone: "text-primary" },
                  { label: "Avg response", value: "8m 42s", icon: Radio, tone: "text-success" },
                ].map(s => (
                  <div key={s.label} className="rounded-xl border bg-card p-4 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</span>
                      <s.icon className={`h-4 w-4 ${s.tone}`} />
                    </div>
                    <div className="mt-2 text-2xl font-bold tracking-tight">{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="px-4 pb-4 grid md:grid-cols-2 gap-3">
                <div className="rounded-xl border p-4 bg-gradient-to-br from-emergency/5 to-transparent">
                  <div className="flex items-center gap-2 text-xs text-emergency font-medium"><span className="h-1.5 w-1.5 rounded-full bg-emergency animate-pulse" /> NEW SOS · CC-2412</div>
                  <p className="text-sm mt-1 font-medium">Flood reported · Sector 12, Mumbai</p>
                  <p className="text-xs text-muted-foreground mt-1">AI triage HIGH · Team Alpha-3 dispatched · ETA 7m</p>
                </div>
                <div className="rounded-xl border p-4 bg-gradient-to-br from-success/5 to-transparent">
                  <div className="flex items-center gap-2 text-xs text-success font-medium"><CheckCircle2 className="h-3 w-3" /> Resolved · CC-2389</div>
                  <p className="text-sm mt-1 font-medium">42 citizens safely evacuated</p>
                  <p className="text-xs text-muted-foreground mt-1">Shelter Civic Center 4 · 38 beds remaining</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Stats() {
  const data = [
    { v: "12,400+", l: "Lives assisted" },
    { v: "1,842", l: "Active volunteers" },
    { v: "98.6%", l: "SOS response rate" },
    { v: "8m 42s", l: "Avg dispatch time" },
  ];
  return (
    <section className="border-y bg-muted/20">
      <div className="mx-auto max-w-6xl px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-6">
        {data.map(d => (
          <div key={d.l} className="text-center">
            <div className="text-3xl md:text-4xl font-bold tracking-tight">{d.v}</div>
            <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{d.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: ShieldAlert, title: "One-tap SOS", desc: "Instantly notify rescue teams with location, photos, and AI severity classification." },
    { icon: MessageSquareText, title: "AI disaster assistant", desc: "Conversational guidance for every emergency, available offline-first in 12 languages." },
    { icon: Building2, title: "Shelter network", desc: "Live capacity, facilities, and routing across 30+ shelters in your region." },
    { icon: Radio, title: "Dispatch command", desc: "Multi-agency coordination, vehicle tracking, and resource allocation in one canvas." },
    { icon: BarChart3, title: "Predictive analytics", desc: "Forecast hotspots, allocate volunteers, and brief authorities with one-click reports." },
    { icon: Globe2, title: "Government-grade", desc: "Audit logs, role-based access, and policy controls trusted by national disaster authorities." },
  ];
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center max-w-2xl mx-auto">
          <Badge variant="outline" className="rounded-full mb-4">Platform</Badge>
          <h2 className="text-4xl font-bold tracking-tight">Every responder, on the same canvas.</h2>
          <p className="mt-3 text-muted-foreground">From the first SOS to post-incident reporting — one platform, one truth.</p>
        </div>
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Card className="h-full border-border/60 hover:shadow-elegant transition-shadow">
                <CardContent className="p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold tracking-tight">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Citizen reports", d: "Open the app, tap SOS or report any emergency in seconds. Location and media auto-attached." },
    { n: "02", t: "AI triages", d: "Severity, type, and recommended response are classified within 800ms." },
    { n: "03", t: "Network dispatches", d: "Volunteers and rescue teams nearby are matched and routed automatically." },
    { n: "04", t: "Authority oversees", d: "National dashboards track every incident, asset, and outcome in real time." },
  ];
  return (
    <section id="how" className="py-24 bg-muted/30">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center max-w-2xl mx-auto">
          <Badge variant="outline" className="rounded-full mb-4">How it works</Badge>
          <h2 className="text-4xl font-bold tracking-tight">From SOS to safety in minutes.</h2>
        </div>
        <div className="mt-12 grid md:grid-cols-4 gap-4">
          {steps.map(s => (
            <div key={s.n} className="rounded-2xl border bg-card p-6 shadow-elegant">
              <div className="text-xs font-mono text-primary">{s.n}</div>
              <div className="mt-2 font-semibold">{s.t}</div>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Categories() {
  const cats = [
    { i: Droplets, l: "Floods", c: "text-info bg-info/10" },
    { i: Wind, l: "Cyclones", c: "text-primary bg-primary/10" },
    { i: Mountain, l: "Earthquakes", c: "text-warning bg-warning/10" },
    { i: Flame, l: "Fires", c: "text-emergency bg-emergency/10" },
    { i: Layers, l: "Landslides", c: "text-warning bg-warning/10" },
    { i: Heart, l: "Medical", c: "text-emergency bg-emergency/10" },
  ];
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <Badge variant="outline" className="rounded-full mb-4">Coverage</Badge>
        <h2 className="text-4xl font-bold tracking-tight">Built for every emergency.</h2>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-6 gap-3">
          {cats.map(c => (
            <div key={c.l} className="rounded-2xl border bg-card p-5 hover:shadow-elegant transition">
              <div className={`h-11 w-11 mx-auto rounded-xl flex items-center justify-center ${c.c}`}>
                <c.i className="h-5 w-5" />
              </div>
              <div className="mt-3 text-sm font-medium">{c.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Network() {
  return (
    <section id="network" className="py-24 bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <Badge variant="outline" className="rounded-full mb-4">Volunteer network</Badge>
          <h2 className="text-4xl font-bold tracking-tight">A nation of first responders.</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            1,842 trained volunteers active across 47 cities, ready to deploy in under 9 minutes.
            Earn impact scores, unlock certifications, and save lives.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["First Aid", "Search & Rescue", "Water Safety", "Disaster Comms", "Trauma Care"].map(t => (
              <Badge key={t} variant="secondary" className="rounded-full">{t}</Badge>
            ))}
          </div>
          <Button asChild className="mt-7 rounded-full"><Link to="/login">Become a volunteer <ArrowRight className="h-4 w-4 ml-1.5" /></Link></Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { v: "1,842", l: "Active volunteers", c: "text-primary" },
            { v: "47", l: "Cities covered", c: "text-info" },
            { v: "98.6%", l: "Mission success", c: "text-success" },
            { v: "8m", l: "Avg deployment", c: "text-warning" },
          ].map(s => (
            <Card key={s.l} className="shadow-elegant">
              <CardContent className="p-6">
                <div className={`text-3xl font-bold ${s.c}`}>{s.v}</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.l}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const t = [
    { q: "ResQNet cut our dispatch time in half during the Chennai floods. A genuine paradigm shift.", n: "Dr. Anita Rao", r: "Director, National Disaster Authority" },
    { q: "As a volunteer, I finally feel coordinated. Missions are matched to my skills and routed to me instantly.", n: "Priya Patel", r: "Volunteer · Chennai" },
    { q: "The AI assistant guided my family through the cyclone hour by hour. We owe a lot to this app.", n: "Aarav Sharma", r: "Citizen · Mumbai" },
  ];
  return (
    <section id="testimonials" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center max-w-2xl mx-auto">
          <Badge variant="outline" className="rounded-full mb-4">Stories</Badge>
          <h2 className="text-4xl font-bold tracking-tight">Trusted in the most critical moments.</h2>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-4">
          {t.map(x => (
            <Card key={x.n} className="shadow-elegant border-border/60">
              <CardContent className="p-6">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-warning text-warning" />)}
                </div>
                <p className="mt-3 text-sm leading-relaxed">"{x.q}"</p>
                <div className="mt-5">
                  <div className="text-sm font-medium">{x.n}</div>
                  <div className="text-xs text-muted-foreground">{x.r}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="relative overflow-hidden rounded-3xl border gradient-primary p-12 text-center text-primary-foreground shadow-glow">
          <div className="absolute inset-0 gradient-mesh opacity-30 mix-blend-overlay" />
          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Be ready when it matters.</h2>
            <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">Open the live demo and explore every role: citizen, volunteer, rescue team, and authority.</p>
            <Button asChild size="lg" variant="secondary" className="mt-7 rounded-full h-12 px-6">
              <Link to="/login">Launch demo <ArrowRight className="h-4 w-4 ml-2" /></Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t py-10">
      <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-primary text-white">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold">ResQNet</span>
          <span className="text-xs text-muted-foreground ml-2">© 2026</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#" className="hover:text-foreground">Contact</a>
        </div>
      </div>
    </footer>
  );
}

function Landing() {
  return (
    <div className="min-h-screen">
      <Nav />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Categories />
      <Network />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}
