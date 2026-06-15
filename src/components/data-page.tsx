import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type ReactNode } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
  badge?: { text: string; tone?: "primary" | "success" | "warning" | "emergency" | "info" | "muted" };
  icon?: any;
  iconClass?: string;
}

export function DataPage({
  pageTitle, pageSubtitle, items, headerExtra, sidePanel, emptyHint = "Nothing here yet.",
}: {
  pageTitle: string;
  pageSubtitle?: string;
  items: ListItem[];
  headerExtra?: ReactNode;
  sidePanel?: ReactNode;
  emptyHint?: string;
}) {
  const toneMap = {
    primary: "bg-primary/10 text-primary border-primary/20",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    emergency: "bg-emergency/10 text-emergency border-emergency/20",
    info: "bg-info/10 text-info border-info/20",
    muted: "bg-muted text-foreground border-border",
  };
  return (
    <AppShell title={pageTitle} actions={headerExtra}>
      {pageSubtitle && <p className="text-muted-foreground -mt-1 mb-6">{pageSubtitle}</p>}
      <div className={cn("grid gap-4", sidePanel ? "lg:grid-cols-[1.4fr_1fr]" : "")}>
        <Card className="shadow-elegant border-border/60">
          <CardContent className="p-4 md:p-5">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search…" className="pl-9 h-10 bg-muted/40 border-0" />
            </div>
            {items.length === 0 ? (
              <div className="py-16 text-center text-sm text-muted-foreground">{emptyHint}</div>
            ) : (
              <div className="divide-y">
                {items.map((it, i) => (
                  <motion.div
                    key={it.id}
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.3) }}
                    className="flex items-center gap-3 py-3"
                  >
                    {it.icon && (
                      <div className={cn("h-10 w-10 shrink-0 rounded-xl flex items-center justify-center", it.iconClass || "bg-primary/10 text-primary")}>
                        <it.icon className="h-5 w-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{it.title}</div>
                      {it.subtitle && <div className="text-xs text-muted-foreground truncate">{it.subtitle}</div>}
                    </div>
                    {it.meta && <div className="hidden sm:block text-xs text-muted-foreground">{it.meta}</div>}
                    {it.badge && (
                      <Badge variant="outline" className={cn("capitalize font-normal", toneMap[it.badge.tone || "muted"])}>{it.badge.text}</Badge>
                    )}
                    <Button size="sm" variant="ghost" className="h-8">View</Button>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        {sidePanel}
      </div>
    </AppShell>
  );
}
