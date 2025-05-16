// export const dynamic = "force-dynamic";

import { ClientsView } from "@/features/customer/clients/components/clients-view";
import { getAllClients } from "@/sanity/lib/clients/getAllClients";

export default async function ClientsPage() {
  const clients = await getAllClients();
  return (
    <div className="flex flex-col">
      <div className="flex h-full flex-col">
        <ClientsView clients={clients} />
      </div>
    </div>
  );
}
