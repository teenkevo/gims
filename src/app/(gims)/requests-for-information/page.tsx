import RFIModule from "@/features/customer/rfi/components/rfi";
import { getAllClients } from "@/sanity/lib/clients/getAllClients";
import { getAllPersonnel } from "@/sanity/lib/personnel/getAllPersonnel";
import { getAllProjects } from "@/sanity/lib/projects/getAllProjects";
import { getAllRFIs } from "@/sanity/lib/requests-for-information/getAllRFIs";

export default async function RFIPage() {
  const [rfis, personnel, clients] = await Promise.all([
    getAllRFIs(),
    getAllPersonnel(),
    getAllClients(),
  ]);

  return (
    <div className="flex flex-col">
      <div className="flex h-full flex-col">
        <RFIModule rfis={rfis} labPersonnel={personnel} clients={clients} />
      </div>
    </div>
  );
}
