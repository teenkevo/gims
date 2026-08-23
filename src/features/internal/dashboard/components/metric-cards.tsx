import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  CircleAlert,
  FilePlus,
  FileStack,
  FileText,
  Minus,
  type LucideIcon,
} from "lucide-react";

import type { DashboardData } from "@/sanity/lib/dashboard/getSetupProgress";

type MonthChange =
  | {
      mode: "percent";
      percent: number;
      direction: "up" | "down" | "flat";
    }
  | {
      mode: "added";
      added: number;
      direction: "up";
    };

function getMonthChange(
  current: number,
  startOfMonth: number
): MonthChange | null {
  const added = current - Math.max(startOfMonth, 0);

  if (startOfMonth <= 0) {
    if (added <= 0) return null;
    return { mode: "added", added, direction: "up" };
  }

  const percent = Math.round((added / startOfMonth) * 100);
  const direction = percent > 0 ? "up" : percent < 0 ? "down" : "flat";
  return { mode: "percent", percent, direction };
}

type Metric = {
  label: string;
  value: number;
  href: string;
  icon: LucideIcon;
  iconClassName?: string;
  change?: MonthChange | null;
};

function MetricCard({
  label,
  value,
  href,
  icon: Icon,
  iconClassName,
  change,
}: Metric) {
  return (
    <Link
      href={href}
      prefetch
      className="rounded-xl border bg-gradient-to-b from-muted/20 to-muted/40 p-4 shadow-sm transition-colors hover:bg-muted/40"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium ">{label}</p>
        {change ? (
          <ChangeBadge change={change} />
        ) : (
          <Icon
            className={`size-4 shrink-0 ${iconClassName ?? "text-muted-foreground"}`}
            strokeWidth={1}
          />
        )}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        {change ? <ChangeArrow change={change} /> : null}
      </div>
      {change ? (
        <p className="mt-4 text-xs text-foreground">
          {change.mode === "added"
            ? `+${change.added} this month`
            : change.direction === "up"
              ? `Up ${change.percent}% this month`
              : change.direction === "down"
                ? `Down ${Math.abs(change.percent)}% this month`
                : "No change this month"}
        </p>
      ) : null}
    </Link>
  );
}

function ChangeBadge({ change }: { change: MonthChange }) {
  const isUp = change.direction === "up";
  const isDown = change.direction === "down";

  return (
    <span
      className={`rounded-md px-2 py-0.5 text-xs font-medium ${
        isUp
          ? "bg-primary/20 text-primary"
          : isDown
            ? "bg-destructive/10 text-destructive"
            : "bg-muted text-muted-foreground"
      }`}
    >
      {change.mode === "added"
        ? `+${change.added}`
        : `${isUp ? "+" : ""}${change.percent}%`}
    </span>
  );
}

function ChangeArrow({ change }: { change: MonthChange }) {
  const isUp = change.direction === "up";
  const isDown = change.direction === "down";

  return (
    <span
      className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
        isUp
          ? "bg-primary/20 text-primary"
          : isDown
            ? "bg-destructive/10 text-destructive"
            : "bg-muted text-muted-foreground"
      }`}
    >
      {isUp ? (
        <ArrowUp className="size-3.5" strokeWidth={2} />
      ) : isDown ? (
        <ArrowDown className="size-3.5" strokeWidth={2} />
      ) : (
        <Minus className="size-3.5" strokeWidth={2} />
      )}
    </span>
  );
}

export function MetricCards({
  data,
}: {
  data: Pick<
    DashboardData,
    | "projects"
    | "projectsAtStartOfMonth"
    | "awaitingClient"
    | "overdueProjects"
    | "needsQuotation"
  >;
}) {
  const metrics: Metric[] = [
    {
      label: "Projects",
      value: data.projects,
      href: "/projects",
      icon: FileStack,
      change: getMonthChange(data.projects, data.projectsAtStartOfMonth),
    },
    {
      label: "Quotations Awaiting Feedback",
      value: data.awaitingClient,
      href: "/projects?quotation=sent",
      icon: FileText,
    },
    {
      label: "Overdue",
      value: data.overdueProjects,
      href: "/projects?due=overdue",
      icon: CircleAlert,
      iconClassName: "text-destructive",
    },
    {
      label: "Needs quotation",
      value: data.needsQuotation,
      href: "/projects?quotation=none",
      icon: FilePlus,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.label} {...metric} />
      ))}
    </div>
  );
}
