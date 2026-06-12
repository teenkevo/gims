import { CreateProjectForm } from "@/features/internal/projects/components/create-project-form";
import { getAllClients } from "@/sanity/lib/clients/getAllClients";

export default async function CreateProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ labId?: string }>;
}) {
  const { labId } = await searchParams;
  const clients = await getAllClients();
  return (
    <div className="flex flex-col">
      <CreateProjectForm clients={clients} labId={labId} />
    </div>
  );
}
