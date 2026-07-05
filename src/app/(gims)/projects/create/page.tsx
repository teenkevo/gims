import { CreateProjectForm } from "@/features/internal/projects/components/create-project-form";
import { getAllClients } from "@/sanity/lib/clients/getAllClients";
import { requirePermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default async function CreateProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ labId?: string }>;
}) {
  await requirePermission(PERMISSIONS["projects:create"]);

  const { labId } = await searchParams;
  const clients = await getAllClients();
  return (
    <div className="flex flex-col">
      <CreateProjectForm clients={clients} labId={labId} />
    </div>
  );
}
