import { ProjectsView } from "@/features/internal/projects/components/projects-view";
import { getAllProjects } from "@/sanity/lib/projects/getAllProjects";

export default async function ProjectsPage() {
  const projects = await getAllProjects();
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex h-full flex-col">
        <ProjectsView projects={projects} />
      </div>
    </div>
  );
}
