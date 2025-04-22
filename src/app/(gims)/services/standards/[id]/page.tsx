export const dynamic = "force-dynamic";

import React from "react";
import { getStandardById } from "@/sanity/lib/services/getStandardById";
import { getAllTestMethods } from "@/sanity/lib/services/getAllTestMethods";
import StandardDetails from "@/features/customer/services/components/standards/standard-details";
import { getAllStandards } from "@/sanity/lib/services/getAllStandards";
export default async function StandardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch data in parallel
  const [standardData, existingTestMethodsData, standardsData] =
    await Promise.all([
      getStandardById(id),
      getAllTestMethods(),
      getAllStandards(),
    ]);

  // If project is not found, show 404 placeholder
  if (!standardData || standardData.length === 0) {
    return <p>NO standard found</p>;
  }

  return (
    <StandardDetails
      standards={standardsData}
      standard={standardData[0]}
      existingTestMethods={existingTestMethodsData}
    />
  );
}
