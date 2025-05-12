export const dynamic = "force-dynamic";

import NoProjectPlaceholder from "@/features/internal/projects/components/no-project-placeholder";
import ProjectDetails from "@/features/internal/projects/components/project-details";

import React from "react";
import { getProjectById } from "@/sanity/lib/projects/getProjectById";
import { getAllContacts } from "@/sanity/lib/clients/getAllContacts";
import { getAllClients } from "@/sanity/lib/clients/getAllClients";
import { getAllServices } from "@/sanity/lib/services/getAllServices";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch data in parallel
  const [
    projectData,
    existingContactsData,
    existingClientsData,
    allServicesData,
  ] = await Promise.all([
    getProjectById(id),
    getAllContacts(),
    getAllClients(),
    getAllServices(),
  ]);

  // If project is not found, show 404 placeholder
  if (!projectData || projectData.length === 0) {
    return <NoProjectPlaceholder />;
  }

  return (
    <ProjectDetails
      project={projectData[0]}
      existingContacts={existingContactsData}
      existingClients={existingClientsData}
      allServices={allServicesData}
    />
  );
}
