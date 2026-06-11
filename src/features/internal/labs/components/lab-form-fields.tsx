"use client";

import type {
  ALL_EQUIPMENT_QUERY_RESULT,
  ALL_PERSONNEL_QUERY_RESULT,
  ALL_SERVICES_QUERY_RESULT,
} from "../../../../../sanity.types";
import { LabIdentityStep } from "./create-lab-steps/lab-identity-step";
import { LabStaffingStep } from "./create-lab-steps/lab-staffing-step";
import { LabResourcesStep } from "./create-lab-steps/lab-resources-step";
import { LabAccreditationStep } from "./create-lab-steps/lab-accreditation-step";

export type { LabFormValues } from "./lab-form-types";

export function LabFormFields({
  personnel,
  equipment,
  services,
  isSubmitting,
}: {
  personnel: ALL_PERSONNEL_QUERY_RESULT;
  equipment: ALL_EQUIPMENT_QUERY_RESULT;
  services: ALL_SERVICES_QUERY_RESULT;
  isSubmitting?: boolean;
}) {
  return (
    <div className="space-y-4">
      <LabIdentityStep isSubmitting={isSubmitting} />
      <LabStaffingStep personnel={personnel} isSubmitting={isSubmitting} />
      <LabResourcesStep
        equipment={equipment}
        services={services}
        isSubmitting={isSubmitting}
      />
      <LabAccreditationStep isSubmitting={isSubmitting} />
    </div>
  );
}
