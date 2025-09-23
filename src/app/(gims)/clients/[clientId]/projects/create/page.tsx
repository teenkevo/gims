import { CreateProjectForClientForm } from "@/features/customer/clients/components/create-project-for-client";

export default async function CreateProjectForClientPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  return (
    <div className="flex flex-col">
      <CreateProjectForClientForm clientId={clientId} />
    </div>
  );
}
