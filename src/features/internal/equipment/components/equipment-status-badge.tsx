import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getEquipmentStatusLabel } from "../constants";

const statusStyles: Record<string, string> = {
  available:
    "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400",
  in_use:
    "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  under_maintenance:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  retired: "border-muted-foreground/30 bg-muted text-muted-foreground",
};

export function EquipmentStatusBadge({ status }: { status?: string | null }) {
  return (
    <Badge
      variant="outline"
      className={cn("font-normal", statusStyles[status ?? ""] ?? "")}
    >
      {getEquipmentStatusLabel(status)}
    </Badge>
  );
}
