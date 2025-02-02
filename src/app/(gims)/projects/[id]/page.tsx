import NoProjectPlaceholder from "@/features/internal/projects/components/no-project-placeholder";
import ProjectDetails from "@/features/internal/projects/components/project-details";

import React from "react";
import { getProjectById } from "@/sanity/lib/projects/getProjectById";

export default async function ProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const projectArray = await getProjectById(params.id);
  const project = projectArray[0];

  return project ? <ProjectDetails {...project} /> : <NoProjectPlaceholder />;
}
