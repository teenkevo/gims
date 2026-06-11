import { notFound } from "next/navigation";

import EquipmentDetails from "@/features/internal/equipment/components/equipment-details";
import { getEquipmentById } from "@/sanity/lib/equipment/getEquipmentById";
import { getAllPersonnel } from "@/sanity/lib/personnel/getAllPersonnel";

export default async function EquipmentDetailsPage({
  params,
}: {
  params: Promise<{ equipmentId: string }>;
}) {
  const { equipmentId } = await params;

  const [items, personnel] = await Promise.all([
    getEquipmentById(equipmentId),
    getAllPersonnel(),
  ]);

  const item = items?.[0];

  if (!item) {
    notFound();
  }

  return (
    <div className="flex flex-col">
      <EquipmentDetails item={item} personnel={personnel} />
    </div>
  );
}
