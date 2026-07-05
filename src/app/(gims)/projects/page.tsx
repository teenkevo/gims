import { ProjectsView } from "@/features/internal/projects/components/projects-view";
import { requirePermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getProjectsForSession } from "@/lib/auth/get-projects-for-session";

export default async function ProjectsPage() {
  const session = await requirePermission(PERMISSIONS["projects:read"]);
  const projects = await getProjectsForSession(session);

  return (
    <div className="flex flex-col">
      <div className="flex h-full flex-col">
        <ProjectsView projects={projects} />
      </div>
    </div>
  );
}
