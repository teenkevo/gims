import { CreateProjectForClientForm } from "@/features/customer/clients/components/create-project-for-client";
import { requirePermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default async function CreateProjectForClientPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  await requirePermission(PERMISSIONS["projects:create"]);

  const { clientId } = await params;
  return (
    <div className="flex flex-col">
      <CreateProjectForClientForm clientId={clientId} />
    </div>
  );
}
