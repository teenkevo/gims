export const dynamic = "force-dynamic";

import React, { Suspense } from "react";
import { getAllContacts } from "@/sanity/lib/clients/getAllContacts";
import { getAllClients } from "@/sanity/lib/clients/getAllClients";
import { getAllServices } from "@/sanity/lib/services/getAllServices";
import Loading from "./loading";
import { getClientById } from "@/sanity/lib/clients/getClientById";
import NoClientPlaceholder from "@/features/customer/clients/components/no-client-placeholder";
import ClientDetails from "@/features/customer/clients/components/client-details";

export default async function ClientPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;

  // Fetch data in parallel
  const [clientData, existingContactsData, existingClientsData, allServicesData] =
    await Promise.all([
      getClientById(clientId),
      getAllContacts(),
      getAllClients(),
      getAllServices(),
    ]);

  // If project is not found, show 404 placeholder
  if (!clientData || clientData.length === 0) {
    return <NoClientPlaceholder />;
  }

  return (
    <Suspense fallback={<Loading />}>
      <ClientDetails client={clientData[0]} />
    </Suspense>
  );
}
