"use client";

import Link from "next/link";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import NoProjectsPlaceholder from "@/features/internal/projects/components/no-projects-placeholder";
import { useRBAC } from "@/components/rbac-context";
import { PERMISSIONS } from "@/lib/auth/permissions";
import type { DashboardProject } from "@/sanity/lib/dashboard/getSetupProgress";

function projectHref(project: DashboardProject) {
  const name = project.name ?? "";
  return `/projects/${project._id}?project=${encodeURIComponent(name)}&tab=details`;
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
                className="flex items-start justify-between gap-3 px-5 py-3 transition-colors hover:bg-muted/50"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {project.name ?? "Untitled project"}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {[
                      project.internalId,
                      project.clientName,
                      project.endDate
                        ? `Due ${format(new Date(project.endDate), "LLL d, yyyy")}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
                <Badge
                  variant={project.quoted ? "default" : "secondary"}
                  className="shrink-0 font-normal"
                >
                  {project.quoted ? "Quoted" : "In progress"}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
