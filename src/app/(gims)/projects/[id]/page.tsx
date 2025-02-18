export const dynamic = "force-dynamic";

import NoProjectPlaceholder from "@/features/internal/projects/components/no-project-placeholder";
import ProjectDetails from "@/features/internal/projects/components/project-details";

import React from "react";
import { getProjectById } from "@/sanity/lib/projects/getProjectById";
import { getAllContacts } from "@/sanity/lib/clients/getAllContacts";
import { getAllClients } from "@/sanity/lib/clients/getAllClients";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch data in parallel
  const [projectData, existingContactsData, existingClientsData] =
    await Promise.all([getProjectById(id), getAllContacts(), getAllClients()]);

  // Ensure projectData exists and is not an empty array
  const hasProject = projectData && projectData.length > 0;

  return hasProject ? (
    <ProjectDetails
      project={projectData[0]}
      existingContacts={existingContactsData}
      existingClients={existingClientsData}
    />
  ) : (
    <NoProjectPlaceholder />
  );
}
