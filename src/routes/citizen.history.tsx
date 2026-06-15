import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { incidents } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { typeIcon, typeColor, SeverityBadge, StatusBadge } from "@/components/shared";
import { cn } from "@/lib/utils";

function HistoryView() {
  const items = incidents.slice(0, 12);
  return (
    <AppShell title="Emergency history">
      <p className="text-muted-foreground -mt-1 mb-6">
        Your reported incidents and their outcomes.
      </p>
      <Card>
        <CardContent className="p-4 divide-y">
          {items.map((i) => {
            const I = typeIcon[i.type];
            return (
              <div key={i.id} className="flex items-center gap-3 py-3">
                <div
                  className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center",
                    typeColor[i.type],
                  )}
                >
                  <I className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">
                    {i.caseId} · {i.title}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {i.location} · {new Date(i.reportedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="hidden sm:flex gap-2">
                  <SeverityBadge severity={i.severity} />
                  <StatusBadge status={i.status} />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </AppShell>
  );
}
export const Route = createFileRoute("/citizen/history")({ component: HistoryView });
