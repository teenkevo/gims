export const dynamic = "force-dynamic";

import React from "react";
import { getStandardById } from "@/sanity/lib/services/getStandardById";
import { getAllTestMethods } from "@/sanity/lib/services/getAllTestMethods";
import StandardDetails from "@/features/customer/services/components/standards/standard-details";
import { getAllStandards } from "@/sanity/lib/services/getAllStandards";
import ServiceDetails from "@/features/customer/services/components/service-details/service-details";
import { getServiceById } from "@/sanity/lib/services/getServiceById";
import { getAllSampleClasses } from "@/sanity/lib/services/getAllSampleClasses";
import { getTestMethodById } from "@/sanity/lib/services/getTestMethodById";
import TestMethodDetails from "@/features/customer/services/components/test-methods/test-method.details";
export default async function TestMethodPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch data in parallel
  const [testMethodData, standardsData] = await Promise.all([
    getTestMethodById(id),
    getAllStandards(),
  ]);

  // If project is not found, show 404 placeholder
  if (!testMethodData || testMethodData.length === 0) {
    return <p>NO test method found</p>;
  }

  return (
    <TestMethodDetails
      testMethod={testMethodData[0]}
      standards={standardsData}
    />
  );
}
