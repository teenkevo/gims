import Personnel from "@/features/internal/personnel/components/personnel";

import { getAllPersonnel } from "@/sanity/lib/personnel/getAllPersonnel";
import { getAllDepartments } from "@/sanity/lib/departments/getAllDepartments";

export default async function Page() {
  // Fetch data in parallel
  const [personnel, departments] = await Promise.all([
    getAllPersonnel(),
    getAllDepartments(),
  ]);

  return <Personnel personnel={personnel} departments={departments} />;
}
