import { LabsView } from "@/features/internal/labs/components/labs-view";
import { getAllLabs } from "@/sanity/lib/labs/getAllLabs";

export default async function LabsPage() {
  const labs = await getAllLabs();

  return (
    <div className="flex flex-col">
      <LabsView labs={labs} />
    </div>
  );
}
