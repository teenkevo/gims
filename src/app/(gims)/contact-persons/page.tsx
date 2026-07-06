import { redirect } from "next/navigation";
import { getClientById } from "@/sanity/lib/clients/getClientById";
import { requireClientSession } from "@/lib/auth/session";
import { ContactPersonsPortalView } from "@/features/customer/clients/components/contact-persons-portal-view";
import NoClientPlaceholder from "@/features/customer/clients/components/no-client-placeholder";

export default async function ContactPersonsPage() {
  let session;

  try {
    session = await requireClientSession();
  } catch {
    redirect("/projects");
  }

  const clientData = await getClientById(session.clientId);

  if (!clientData || clientData.length === 0) {
    return <NoClientPlaceholder />;
  }

  return <ContactPersonsPortalView client={clientData[0]} />;
}
