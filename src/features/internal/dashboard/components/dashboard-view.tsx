import Link from "next/link";
import { FileStack, UserRound, FileText } from "lucide-react";

import { GettingStarted } from "./getting-started";
import { DashboardHeader } from "./dashboard-header";
import { MetricCards } from "./metric-cards";
import { DashboardProjectList } from "./dashboard-project-list";
import { WorkloadCard } from "./workload-card";
import type { DashboardData } from "@/sanity/lib/dashboard/getSetupProgress";
import { cn } from "@/lib/utils";

export function DashboardView({
  firstName,
  fullName,
  data,
}: {
  firstName: string | null;
  fullName: string;
  data: DashboardData;
}) {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader firstName={firstName} fullName={fullName} />
      <MetricCards data={data} />
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_minmax(0,32rem)]">
        <div className="order-1 flex flex-col gap-6 lg:order-2">
          <GettingStarted progress={data} />
          <WorkloadCard labs={data.labWorkload} staff={data.staffWorkload} />
        </div>
        <div className="order-2 lg:order-1">
          <DashboardProjectList
            upcomingProjects={data.upcomingProjects}
            recentProjects={data.recentProjects}
          />
        </div>
      </div>
    </div>
  );
}

export function ClientDashboardView({
  firstName,
  fullName,
  projects,
  projectsAtStartOfMonth,
  awaitingClient,
  overdueProjects,
  needsQuotation,
  projectItems,
}: {
  firstName: string | null;
  fullName: string;
  projects: number;
  projectsAtStartOfMonth: number;
  awaitingClient: number;
  overdueProjects: number;
  needsQuotation: number;
  projectItems: DashboardData["recentProjects"];
}) {
  const links = [
    {
      href: "/projects",
      title: "Projects",
      description: "Open your projects, reports, and billing.",
      icon: FileStack,
    },
    {
      href: "/my-client-profile",
      title: "Your profile",
      description: "Review contact details for your organization.",
      icon: UserRound,
    },
    {
      href: "/requests-for-information",
      title: "Requests for Information",
      description: "Follow up on RFIs with the GETLAB team.",
      icon: FileText,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        firstName={firstName}
        fullName={fullName}
        variant="client"
      />
      <MetricCards
        data={{
          projects,
          projectsAtStartOfMonth,
          awaitingClient,
          overdueProjects,
          needsQuotation,
        }}
      />
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <DashboardProjectList
          upcomingProjects={[]}
          recentProjects={projectItems}
        />
        <div className="grid gap-3">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              className={cn(
                "group flex items-start gap-3 rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-muted/50"
              )}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <item.icon className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold">{item.title}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {item.description}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
