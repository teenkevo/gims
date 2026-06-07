import { notFound } from "next/navigation";

import LabDetails from "@/features/internal/labs/components/lab-details";
import { getAllEquipment } from "@/sanity/lib/equipment/getAllEquipment";
import { getLabById } from "@/sanity/lib/labs/getLabById";
import { getAllPersonnel } from "@/sanity/lib/personnel/getAllPersonnel";
import { getAllServices } from "@/sanity/lib/services/getAllServices";

export default async function LabDetailsPage({
  params,
}: {
  params: Promise<{ labId: string }>;
}) {
  const { labId } = await params;

  const [labs, personnel, equipment, services] = await Promise.all([
    getLabById(labId),
    getAllPersonnel(),
    getAllEquipment(),
    getAllServices(),
  ]);

  const lab = labs?.[0];

  if (!lab) {
    notFound();
  }

  return (
    <div className="flex flex-col">
      <LabDetails
        lab={lab}
        personnel={personnel}
        equipment={equipment}
        services={services}
      />
    </div>
  );
}
