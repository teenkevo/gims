import NoProjectPlaceholder from "@/features/internal/projects/components/no-project-placeholder";
import ProjectDetails from "@/features/internal/projects/components/project-details";

import React, { Suspense } from "react";
import { getProjectById } from "@/sanity/lib/projects/getProjectById";
import { getAllContacts } from "@/sanity/lib/clients/getAllContacts";
import { getAllClients } from "@/sanity/lib/clients/getAllClients";
import { getAllServices } from "@/sanity/lib/services/getAllServices";
import { getAllPersonnel } from "@/sanity/lib/personnel/getAllPersonnel";
import Loading from "./loading";
import { getSampleReviewTemplates } from "@/sanity/lib/projects/getSampleReviewTemplates";
import { getSampleAdequacyTemplates } from "@/sanity/lib/projects/getSampleAdequacyTemplates";
import { requirePermission, getSession } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { requireProjectAccessOrError } from "@/lib/auth/project-scope";
import { redirect } from "next/navigation";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission(PERMISSIONS["projects:read"]);
  const session = await getSession();

  const { id } = await params;

  if (session.isAuthenticated) {
    const denied = await requireProjectAccessOrError(session, id);
    if (denied) {
      redirect("/projects");
    }
  }

  const [
    projectData,
    existingContactsData,
    existingClientsData,
    allServicesData,
    personnelData,
    sampleReviewTemplatesData,
    sampleAdequacyTemplatesData,
  ] = await Promise.all([
    getProjectById(id),
    getAllContacts(),
    getAllClients(),
    getAllServices(),
    getAllPersonnel(),
    getSampleReviewTemplates(),
    getSampleAdequacyTemplates(),
  ]);

  if (!projectData || projectData.length === 0) {
    return <NoProjectPlaceholder />;
  }

  return (
    <Suspense fallback={<Loading />}>
      <ProjectDetails
        project={projectData[0]}
        existingContacts={existingContactsData}
        existingClients={existingClientsData}
        allServices={allServicesData}
        personnel={personnelData}
        sampleReviewTemplates={sampleReviewTemplatesData}
        sampleAdequacyTemplates={sampleAdequacyTemplatesData}
      />
    </Suspense>
  );
}
