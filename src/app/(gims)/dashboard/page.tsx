import { Metadata } from "next";
import {
  ClientDashboardView,
  DashboardView,
} from "@/features/internal/dashboard/components/dashboard-view";
import { requireAuthOrRedirect } from "@/lib/auth/session";
import { USER_TYPES } from "@/lib/auth/user-type";
import {
  countOverdue,
  getDashboardData,
} from "@/sanity/lib/dashboard/getSetupProgress";
import { getProjectsForSession } from "@/lib/auth/get-projects-for-session";

export const metadata: Metadata = {
  title: "Dashboard | GIMS",
  description: "Overview of projects, clients, and setup in GIMS",
};

export default async function DashboardPage() {
  const session = await requireAuthOrRedirect();

  if (session.userType === USER_TYPES.CLIENT) {
    const projects = await getProjectsForSession(session);
    const now = new Date();
    const startOfThisMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ).getTime();
    const projectsAtStartOfMonth = projects.filter((project) => {
      const createdAt = Date.parse(project._createdAt);
      return !Number.isNaN(createdAt) && createdAt < startOfThisMonth;
    }).length;
    const projectItems = projects.slice(0, 6).map((project) => ({
      _id: project._id,
      name: project.name ?? null,
      internalId: project.internalId ?? null,
      startDate: project.startDate ?? null,
      endDate: project.endDate ?? null,
      quoted: Boolean(project.quotation),
      clientName: project.clients?.[0]?.name ?? null,
    }));

    return (
      <ClientDashboardView
        firstName={session.user.firstName}
        fullName={session.user.fullName}
        projects={projects.length}
        projectsAtStartOfMonth={projectsAtStartOfMonth}
        awaitingClient={
          projects.filter((project) => project.quotation?.status === "sent")
            .length
        }
        overdueProjects={countOverdue(
          projects.map((project) => project.endDate)
        )}
        needsQuotation={
          projects.filter((project) => !project.quotation).length
        }
        projectItems={projectItems}
      />
    );
  }

  const data = await getDashboardData();

  return (
    <DashboardView
      firstName={session.user.firstName}
      fullName={session.user.fullName}
      data={data}
    />
  );
}
