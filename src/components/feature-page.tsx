import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { StatCard, SectionTitle } from "@/components/shared";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Search, Filter, Download, Plus, MoreHorizontal, ArrowRight } from "lucide-react";
import { type ReactNode } from "react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  Tooltip, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";

export type Tone = "primary" | "success" | "warning" | "emergency" | "info" | "muted";

const toneMap: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary border-primary/20",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  emergency: "bg-emergency/10 text-emergency border-emergency/20",
  info: "bg-info/10 text-info border-info/20",
  muted: "bg-muted text-foreground border-border",
};

export interface Stat {
  label: string; value: ReactNode; sublabel?: string; icon?: any;
  accent?: "primary" | "emergency" | "success" | "warning" | "info";
}

export interface TableCol { key: string; label: string; className?: string; render?: (row: any) => ReactNode }

export interface ChartConfig {
  title: string;
  type: "line" | "bar" | "area" | "pie";
  data: any[];
  xKey?: string;
  series?: { key: string; color?: string; label?: string }[];
  height?: number;
}

export interface ProgressRow { label: string; value: number; max?: number; tone?: Tone; sub?: string }

export interface FeaturePageProps {
  title: string;
  subtitle?: string;
  stats?: Stat[];
  charts?: ChartConfig[];
  tableTitle?: string;
  tableCols?: TableCol[];
  tableRows?: any[];
  rowBadgeKey?: string;
  filters?: string[];
  progressTitle?: string;
  progressRows?: ProgressRow[];
  sideCards?: { title: string; items: { label: string; value: ReactNode; tone?: Tone }[] }[];
  primaryAction?: { label: string; icon?: any; onClick?: () => void };
  extraActions?: { label: string; icon?: any; variant?: "default" | "outline" | "ghost"; onClick?: () => void }[];
  children?: ReactNode;
}

const palette = [
  "var(--color-primary)",
  "var(--color-info)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-emergency)",
  "var(--color-accent)",
];

function Chart({ cfg }: { cfg: ChartConfig }) {
  const h = cfg.height ?? 260;
  const common = (
    <>
      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
      <XAxis dataKey={cfg.xKey ?? "name"} fontSize={11} stroke="currentColor" opacity={0.5} />
      <YAxis fontSize={11} stroke="currentColor" opacity={0.5} />
      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)", fontSize: 12 }} />
    </>
  );
  return (
    <Card className="shadow-elegant border-border/60">
      <CardContent className="p-5">
        <SectionTitle title={cfg.title} />
        <div style={{ height: h }}>
          <ResponsiveContainer>
            {cfg.type === "line" ? (
              <LineChart data={cfg.data}>
                {common}
                {(cfg.series ?? [{ key: "value" }]).map((s, i) => (
                  <Line key={s.key} type="monotone" dataKey={s.key} stroke={s.color ?? palette[i % palette.length]} strokeWidth={2.5} dot={false} />
                ))}
              </LineChart>
            ) : cfg.type === "bar" ? (
              <BarChart data={cfg.data}>
                {common}
                {(cfg.series ?? [{ key: "value" }]).map((s, i) => (
                  <Bar key={s.key} dataKey={s.key} fill={s.color ?? palette[i % palette.length]} radius={[8, 8, 0, 0]} />
                ))}
              </BarChart>
            ) : cfg.type === "area" ? (
              <AreaChart data={cfg.data}>
                {common}
                {(cfg.series ?? [{ key: "value" }]).map((s, i) => (
                  <Area key={s.key} type="monotone" dataKey={s.key} stroke={s.color ?? palette[i % palette.length]} fill={s.color ?? palette[i % palette.length]} fillOpacity={0.18} strokeWidth={2.5} />
                ))}
              </AreaChart>
            ) : (
              <PieChart>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Pie data={cfg.data} dataKey={cfg.series?.[0]?.key ?? "value"} nameKey={cfg.xKey ?? "name"} innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {cfg.data.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
                </Pie>
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function FeaturePage(props: FeaturePageProps) {
  const {
    title, subtitle, stats, charts, tableTitle, tableCols, tableRows, filters,
    progressTitle, progressRows, sideCards, primaryAction, extraActions, children,
  } = props;

  return (
    <AppShell
      title={title}
      actions={
        <>
          {extraActions?.map((a, i) => {
            const Ic = a.icon;
            return (
              <Button key={i} variant={a.variant ?? "outline"} className="rounded-full" onClick={a.onClick}>
                {Ic && <Ic className="h-4 w-4 mr-1.5" />}{a.label}
              </Button>
            );
          })}
          {primaryAction && (
            <Button className="rounded-full shadow-glow" onClick={primaryAction.onClick}>
              {primaryAction.icon ? <primaryAction.icon className="h-4 w-4 mr-1.5" /> : <Plus className="h-4 w-4 mr-1.5" />}
              {primaryAction.label}
            </Button>
          )}
        </>
      }
    >
      {subtitle && <p className="text-muted-foreground -mt-1 mb-6">{subtitle}</p>}

      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {stats.map((s, i) => (
            <StatCard key={s.label} label={s.label} value={s.value} sublabel={s.sublabel} icon={s.icon} accent={s.accent ?? "primary"} delay={i * 0.05} />
          ))}
        </div>
      )}

      {charts && charts.length > 0 && (
        <div className={cn("grid gap-4 mb-6", charts.length > 1 ? "lg:grid-cols-2" : "")}>
          {charts.map((c, i) => <Chart key={i} cfg={c} />)}
        </div>
      )}

      <div className={cn("grid gap-4", (sideCards?.length || progressRows) ? "lg:grid-cols-[1.6fr_1fr]" : "")}>
        {tableCols && tableRows && (
          <Card className="shadow-elegant border-border/60">
            <CardContent className="p-4 md:p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold tracking-tight">{tableTitle ?? "Records"}</h2>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost"><Filter className="h-4 w-4 mr-1.5" />Filter</Button>
                  <Button size="sm" variant="ghost"><Download className="h-4 w-4 mr-1.5" />Export</Button>
                </div>
              </div>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search…" className="pl-9 h-10 bg-muted/40 border-0" />
              </div>
              {filters && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {filters.map((f, i) => (
                    <Badge key={f} variant="outline" className={cn("rounded-full cursor-pointer", i === 0 && "bg-primary/10 text-primary border-primary/30")}>{f}</Badge>
                  ))}
                </div>
              )}
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                      {tableCols.map(c => <th key={c.key} className={cn("text-left font-medium px-2 pb-3", c.className)}>{c.label}</th>)}
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((row, i) => (
                      <motion.tr
                        key={row.id ?? i}
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.015, 0.25) }}
                        className="border-t hover:bg-accent/40 transition"
                      >
                        {tableCols.map(c => (
                          <td key={c.key} className={cn("px-2 py-3 align-middle", c.className)}>
                            {c.render ? c.render(row) : row[c.key]}
                          </td>
                        ))}
                        <td className="px-2 py-3 text-right">
                          <Button size="icon" variant="ghost" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                <span>Showing {tableRows.length} of {tableRows.length} records</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" className="h-7">Prev</Button>
                  <Button size="sm" variant="ghost" className="h-7">Next <ArrowRight className="h-3 w-3 ml-1" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {(progressRows || sideCards) && (
          <div className="space-y-4">
            {progressRows && (
              <Card>
                <CardContent className="p-5">
                  <SectionTitle title={progressTitle ?? "Capacity"} />
                  <ul className="space-y-4">
                    {progressRows.map(r => {
                      const pct = ((r.value / (r.max ?? 100)) * 100) | 0;
                      return (
                        <li key={r.label}>
                          <div className="flex items-center justify-between text-sm mb-1.5">
                            <span>{r.label}</span>
                            <span className="text-xs text-muted-foreground">{r.sub ?? `${r.value}${r.max ? ` / ${r.max}` : "%"}`}</span>
                          </div>
                          <Progress value={pct} className="h-1.5" />
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            )}
            {sideCards?.map((sc, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <SectionTitle title={sc.title} />
                  <ul className="space-y-2.5 text-sm">
                    {sc.items.map((it, j) => (
                      <li key={j} className="flex items-center justify-between gap-3">
                        <span className="text-muted-foreground">{it.label}</span>
                        {it.tone ? (
                          <Badge variant="outline" className={cn("rounded-full font-normal", toneMap[it.tone])}>{it.value}</Badge>
                        ) : (
                          <span className="font-medium">{it.value}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {children}
    </AppShell>
  );
}

export function PillBadge({ tone = "muted", children }: { tone?: Tone; children: ReactNode }) {
  return <Badge variant="outline" className={cn("rounded-full font-normal capitalize", toneMap[tone])}>{children}</Badge>;
}
