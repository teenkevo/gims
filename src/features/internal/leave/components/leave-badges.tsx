import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getLeavePlanStatusLabel,
  getLeaveSessionStatusLabel,
  getLeaveTypeLabel,
} from "../constants";

const planStyles: Record<string, string> = {
  draft: "border-muted-foreground/30 bg-muted text-muted-foreground",
  submitted:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  approved:
    "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400",
  changes_requested:
    "border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-400",
};

const sessionStyles: Record<string, string> = {
  planned: "border-muted-foreground/30 bg-muted text-muted-foreground",
  pending:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  approved:
    "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400",
  cancelled: "border-destructive/30 bg-destructive/10 text-destructive",
};

const typeStyles: Record<string, string> = {
  annual:
    "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  sick: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400",
  compassionate:
    "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400",
  study:
    "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  parental:
    "border-pink-500/30 bg-pink-500/10 text-pink-700 dark:text-pink-400",
  unpaid: "border-muted-foreground/30 bg-muted text-muted-foreground",
};

export function LeavePlanStatusBadge({ status }: { status?: string | null }) {
  return (
    <Badge
      variant="outline"
      className={cn("font-normal capitalize", planStyles[status ?? "draft"])}
    >
      {getLeavePlanStatusLabel(status)}
    </Badge>
  );
}

export function LeaveSessionStatusBadge({ status }: { status?: string | null }) {
  return (
    <Badge
      variant="outline"
      className={cn("font-normal", sessionStyles[status ?? "planned"])}
    >
      {getLeaveSessionStatusLabel(status)}
    </Badge>
  );
}

export function LeaveTypeBadge({ type }: { type?: string | null }) {
  return (
    <Badge
      variant="outline"
      className={cn("font-normal", typeStyles[type ?? ""] ?? "")}
    >
      {getLeaveTypeLabel(type)}
    </Badge>
  );
}
