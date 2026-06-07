import { CreateLabForm } from "@/features/internal/labs/components/create-lab-form";
import { getAllEquipment } from "@/sanity/lib/equipment/getAllEquipment";
import { getAllPersonnel } from "@/sanity/lib/personnel/getAllPersonnel";
import { getAllServices } from "@/sanity/lib/services/getAllServices";

export default async function CreateLabPage() {
  const [personnel, equipment, services] = await Promise.all([
    getAllPersonnel(),
    getAllEquipment(),
    getAllServices(),
  ]);

  return (
    <div className="flex flex-col">
      <CreateLabForm
        personnel={personnel}
        equipment={equipment}
        services={services}
      />
    </div>
  );
}
