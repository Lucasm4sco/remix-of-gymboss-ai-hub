import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

export function KpiCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  hint?: string;
}) {
  return (
    <Card className="h-full">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          {Icon && <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10"><Icon className="h-4 w-4 text-primary" /></span>}
        </div>
        <div className="mt-3 text-3xl font-bold tabular-nums break-words">{value}</div>
        {hint && <div className="text-xs text-muted-foreground mt-2">{hint}</div>}
      </CardContent>
    </Card>
  );
}