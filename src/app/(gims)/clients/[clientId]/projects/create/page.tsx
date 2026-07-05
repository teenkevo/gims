import { CreateProjectForClientForm } from "@/features/customer/clients/components/create-project-for-client";
import { requirePermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getClientById } from "@/sanity/lib/clients/getClientById";
import NoClientPlaceholder from "@/features/customer/clients/components/no-client-placeholder";

export default async function CreateProjectForClientPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  await requirePermission(PERMISSIONS["projects:create"]);

  const { clientId } = await params;
  const clientData = await getClientById(clientId);

  if (!clientData || clientData.length === 0) {
    return <NoClientPlaceholder />;
  }

  return (
    <div className="flex flex-col">
      <CreateProjectForClientForm
        clientId={clientId}
        clientName={clientData[0].name ?? ""}
      />
    </div>
  );
}
