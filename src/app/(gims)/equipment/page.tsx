import { EquipmentView } from "@/features/internal/equipment/components/equipment-view";
import { getAllEquipment } from "@/sanity/lib/equipment/getAllEquipment";

export default async function EquipmentPage() {
  const equipment = await getAllEquipment();

  return (
    <div className="flex flex-col">
      <EquipmentView equipment={equipment} />
    </div>
  );
}
