import NoProjectPlaceholder from "@/features/internal/projects/components/no-project-placeholder";
import ProjectDetails from "@/features/internal/projects/components/project-details";

import React from "react";
import { getProjectById } from "@/sanity/lib/projects/getProjectById";
import { getAllContacts } from "@/sanity/lib/clients/getAllContacts";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const projectArray = await getProjectById(id);
  const existingContacts = await getAllContacts();
  const project = projectArray[0];

  return project ? (
    <ProjectDetails project={project} existingContacts={existingContacts} />
  ) : (
    <NoProjectPlaceholder />
  );
}
