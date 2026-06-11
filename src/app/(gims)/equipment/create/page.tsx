import { CreateEquipmentForm } from "@/features/internal/equipment/components/create-equipment-form";
import { getAllPersonnel } from "@/sanity/lib/personnel/getAllPersonnel";

export default async function CreateEquipmentPage() {
  const personnel = await getAllPersonnel();

  return (
    <div className="flex flex-col">
      <CreateEquipmentForm personnel={personnel} />
    </div>
  );
}
