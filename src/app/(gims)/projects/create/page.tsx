import { CreateProjectForm } from "@/features/internal/projects/components/create-project-form";

export default async function ProjectsPage() {
  return (
    <div className="flex flex-col p-10">
      <CreateProjectForm />
    </div>
  );
}
