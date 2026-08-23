"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import NoProjectsPlaceholder from "@/features/internal/projects/components/no-projects-placeholder";
import { useRBAC } from "@/components/rbac-context";
import { PERMISSIONS } from "@/lib/auth/permissions";
import type { DashboardProject } from "@/sanity/lib/dashboard/getSetupProgress";
import { getDueInstant, isOverdue } from "@/lib/project-due";

function projectHref(project: DashboardProject) {
  const name = project.name ?? "";
  return `/projects/${project._id}?project=${encodeURIComponent(name)}&tab=details`;
}

function formatDueIn(endDate: string, now = new Date()) {
  const due = getDueInstant(endDate);
  if (!due) return null;
  const overdue = isOverdue(endDate, now);
  const absMs = Math.abs(due.getTime() - now.getTime());
  const days = Math.floor(absMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor(absMs / (1000 * 60 * 60));

  if (days >= 1) {
    const amount = `${days} ${days === 1 ? "day" : "days"}`;
    return overdue ? `${amount} overdue` : `Due in ${amount}`;
  }
  if (hours >= 1) {
    const amount = `${hours} ${hours === 1 ? "hour" : "hours"}`;
    return overdue ? `${amount} overdue` : `Due in ${amount}`;
  }
  return overdue ? "Overdue" : "Due this hour";
}

function DueIn({ endDate }: { endDate: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return <>{formatDueIn(endDate, new Date(now))}</>;
}

export function DashboardProjectList({
  upcomingProjects,
  recentProjects,
}: {
  upcomingProjects: DashboardProject[];
  recentProjects: DashboardProject[];
}) {
  const { can } = useRBAC();
  const canCreate = can(PERMISSIONS["projects:create"]);
  const usingUpcoming = upcomingProjects.length > 0;
  const projects = usingUpcoming ? upcomingProjects : recentProjects;

  return (
    <div className="rounded-2xl border bg-gradient-to-b from-muted/20 to-muted/40 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="text-base font-semibold tracking-tight">
          {usingUpcoming ? "Upcoming deadlines" : "Recent projects"}
        </h2>
        <Link
          href="/projects"
          prefetch
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          View all
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="px-5 pb-5">
          <NoProjectsPlaceholder
            helperText="projects"
            needAction={canCreate}
            createHref="/projects/create?from=dashboard"
            className="h-auto py-8"
          />
        </div>
      ) : (
        <ul className="divide-y border-t">
          {projects.map((project) => (
            <li key={project._id}>
              <Link
                href={projectHref(project)}
                prefetch
                className="block px-5 py-3 transition-colors hover:bg-muted/50"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="min-w-0 truncate text-sm font-medium">
                    {project.name ?? "Untitled project"}
                  </span>
                  {/* <Badge
                    variant={project.quoted ? "default" : "secondary"}
                    className="shrink-0 font-normal"
                  >
                    {project.quoted ? "Quoted" : "In progress"}
                  </Badge> */}
                </span>
                <span className="mt-2 flex items-baseline justify-between gap-3 text-xs text-muted-foreground">
                  <span className="min-w-0 truncate">
                    {[project.internalId, project.clientName]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                  {project.endDate ? (
                    <span className="shrink-0 text-destructive">
                      <DueIn endDate={project.endDate} />
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
