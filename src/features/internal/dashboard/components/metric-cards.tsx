import Link from "next/link";
import {
  Clock,
  FilePlus,
  FileStack,
  FileText,
  type LucideIcon,
} from "lucide-react";

import type { DashboardData } from "@/sanity/lib/dashboard/getSetupProgress";

type Metric = {
  label: string;
  value: number;
  href: string;
  icon: LucideIcon;
  hint?: string;
  hintClassName?: string;
};

function MetricCard({
  label,
  value,
  href,
  icon: Icon,
  hint,
  hintClassName,
}: Metric) {
  return (
    <Link
      href={href}
      prefetch
      className="rounded-xl border bg-gradient-to-b from-muted/20 to-muted/40 p-4 shadow-sm transition-colors hover:bg-muted/40"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon
          className="size-4 shrink-0 text-muted-foreground"
          strokeWidth={1}
        />
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
      {hint ? (
        <p className={`mt-1 text-xs ${hintClassName ?? "text-muted-foreground"}`}>
          {hint}
        </p>
      ) : null}
    </Link>
  );
}

export function MetricCards({
  data,
}: {
  data: Pick<
    DashboardData,
    | "projects"
    | "projectsDueSoon"
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
      hint:
        data.projectsDueSoon > 0
          ? `${data.projectsDueSoon} due in the next 14 days`
          : undefined,
      hintClassName: "text-destructive",
    },
    {
      label: "Quotations Awaiting Feedback",
      value: data.awaitingClient,
      href: "/projects",
      icon: FileText,
    },
    {
      label: "Overdue",
      value: data.overdueProjects,
      href: "/projects",
      icon: Clock,
    },
    {
      label: "Needs quotation",
      value: data.needsQuotation,
      href: "/projects",
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
