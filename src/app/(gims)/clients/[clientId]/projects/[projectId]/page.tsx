export const dynamic = "force-dynamic";

import React, { Suspense } from "react";
import { getAllServices } from "@/sanity/lib/services/getAllServices";
import Loading from "./loading";
import { getProjectById } from "@/sanity/lib/projects/getProjectById";
import NoProjectPlaceholder from "@/features/internal/projects/components/no-project-placeholder";
import ClientProjectView from "@/features/customer/clients/components/client-project-view/client-project-view";

export default async function ClientProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  // Fetch data in parallel
  const [projectData, allServicesData] = await Promise.all([
    getProjectById(projectId),
    getAllServices(),
  ]);

  // If project is not found, show 404 placeholder
  if (!projectData || projectData.length === 0) {
    return <NoProjectPlaceholder />;
  }

  return (
    <Suspense fallback={<Loading />}>
      <ClientProjectView project={projectData[0]} allServices={allServicesData} />
    </Suspense>
  );
}
