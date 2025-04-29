export const dynamic = "force-dynamic";

import React from "react";
import SampleClassDetails from "@/features/customer/services/components/sample-classes/sample-class-details";
import { getSampleClassById } from "@/sanity/lib/services/getSampleClassById";

export default async function SampleClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch data in parallel
  const [sampleClassData] = await Promise.all([getSampleClassById(id)]);

  return <SampleClassDetails sampleClass={sampleClassData[0]} />;
}
