export const dynamic = "force-dynamic";

import React from "react";
import { getStandardById } from "@/sanity/lib/services/getStandardById";
import { getAllTestMethods } from "@/sanity/lib/services/getAllTestMethods";
import StandardDetails from "@/features/customer/services/components/standards/standard-details";
import { getAllStandards } from "@/sanity/lib/services/getAllStandards";
import ServiceDetails from "@/features/customer/services/components/service-details/service-details";
import { getServiceById } from "@/sanity/lib/services/getServiceById";
import { getAllSampleClasses } from "@/sanity/lib/services/getAllSampleClasses";
export default async function StandardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch data in parallel
  const [serviceData, standards, sampleClasses, testMethods] =
    await Promise.all([
      getServiceById(id),
      getAllStandards(),
      getAllSampleClasses(),
      getAllTestMethods(),
    ]);

  // If project is not found, show 404 placeholder
  if (!serviceData || serviceData.length === 0) {
    return <p>NO service found</p>;
  }

  return (
    <ServiceDetails
      service={serviceData[0]}
      standards={standards}
      sampleClasses={sampleClasses}
      testMethods={testMethods}
    />
  );
}
