export const dynamic = "force-dynamic";

import React from "react";
import { getAllStandards } from "@/sanity/lib/services/getAllStandards";
import { getTestMethodById } from "@/sanity/lib/services/getTestMethodById";
import TestMethodDetails from "@/features/customer/services/components/test-methods/test-method.details";

export default async function TestMethodPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [testMethodData, standardsData] = await Promise.all([
    getTestMethodById(id),
    getAllStandards(),
  ]);

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
