import { Metadata } from "next";
import { MasterDataView } from "@/features/customer/services/components/master-data-view";

export const metadata: Metadata = {
  title: "Master Data | GIMS",
  description: "Configure standards, test methods, and sample classes",
};

export default async function MasterPage() {
  return (
    <div className="flex-col md:flex">
      <MasterDataView />
    </div>
  );
}
