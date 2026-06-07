import { Badge } from "@/components/ui/badge";
import { getLabStatusLabel } from "../constants";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  available: "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400",
  under_maintenance:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  retired: "border-muted-foreground/30 bg-muted text-muted-foreground",
  fullCapacity:
    "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-400",
};

export function LabStatusBadge({ status }: { status?: string | null }) {
  return (
    <Badge
      variant="outline"
      className={cn("font-normal", statusStyles[status ?? ""] ?? "")}
    >
      {getLabStatusLabel(status)}
    </Badge>
  );
}
