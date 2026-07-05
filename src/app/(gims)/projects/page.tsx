import { ProjectsView } from "@/features/internal/projects/components/projects-view";
import { getAllProjects } from "@/sanity/lib/projects/getAllProjects";
import { requirePermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default async function ProjectsPage() {
  await requirePermission(PERMISSIONS["projects:read"]);

  const projects = await getAllProjects();
  return (
    <div className="flex flex-col">
      <div className="flex h-full flex-col">
        <ProjectsView projects={projects} />
      </div>
    </div>
  );
}
