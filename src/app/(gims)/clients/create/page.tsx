import { CreateClientForm } from "@/features/customer/clients/components/create-client-form";
import { getAllClients } from "@/sanity/lib/clients/getAllClients";

export default async function CreateProjectPage() {
  const clients = await getAllClients();
  return (
    <div className="flex flex-col">
      <CreateClientForm clients={clients} />
    </div>
  );
}
