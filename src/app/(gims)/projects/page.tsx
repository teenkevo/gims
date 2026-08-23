import { ProjectsView } from "@/features/internal/projects/components/projects-view";
import { requirePermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getProjectsForSession } from "@/lib/auth/get-projects-for-session";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ quotation?: string; due?: string }>;
}) {
  const session = await requirePermission(PERMISSIONS["projects:read"]);
  const projects = await getProjectsForSession(session);
  const { quotation, due } = await searchParams;

  return (
    <div className="flex flex-col">
      <div className="flex h-full flex-col">
        <ProjectsView
          projects={projects}
          quotationStatus={quotation}
          dueStatus={due}
        />
      </div>
    </div>
  );
}
