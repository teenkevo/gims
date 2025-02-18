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
  const project = await getProjectById(id);
  const existingContacts = await getAllContacts();
  const existingClients = await getAllClients();

  // Initiate both requests in parallel
  const [projectData, existingContactsData, existingClientsData] =
    await Promise.all([project, existingContacts, existingClients]);

  // Check if projectData is defined and has at least one item
  const projectDetails =
    projectData && projectData.length > 0 ? projectData[0] : null;

  return projectDetails ? (
    <ProjectDetails
      project={projectDetails}
      existingContacts={existingContactsData}
      existingClients={existingClientsData}
    />
  ) : (
    <NoProjectPlaceholder />
  );
}
