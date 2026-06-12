"use client";

import type { LAB_BY_ID_QUERY_RESULT } from "../../../../../sanity.types";
import NoProjectsPlaceholder from "../../projects/components/no-projects-placeholder";
import { LabProjectsTable } from "./lab-projects-table";
import { LabSectionForm } from "./lab-section-form";

type LabProject = NonNullable<
  LAB_BY_ID_QUERY_RESULT[number]["projects"]
>[number];

export function LabUpdateProjectsForm({
  labId,
  projects,
}: {
  labId: string;
  projects: LabProject[];
}) {
  const createHref = `/projects/create?labId=${labId}`;

  return (
    <LabSectionForm
      title="Assigned Projects"
      description="Projects currently routed through this laboratory"
      showFooter={false}
    >
      {projects.length > 0 ? (
        <LabProjectsTable labId={labId} projects={projects} />
      ) : (
        <NoProjectsPlaceholder
          // description="Create a project and it will be linked to this lab automatically."
          createHref={createHref}
          className="min-h-[320px]"
          needAction
        />
      )}
    </LabSectionForm>
  );
}
