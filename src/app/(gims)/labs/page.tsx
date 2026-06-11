import { LabsView } from "@/features/internal/labs/components/labs-view";
import { getAllLabs } from "@/sanity/lib/labs/getAllLabs";

export default async function LabsPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const [{ registered }, labs] = await Promise.all([
    searchParams,
    getAllLabs(),
  ]);

  return (
    <div className="flex flex-col">
      <LabsView labs={labs} showRegisteredToast={registered === "1"} />
    </div>
  );
}
