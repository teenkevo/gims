"use client";

import type {
  ALL_EQUIPMENT_QUERY_RESULT,
  ALL_SERVICES_QUERY_RESULT,
} from "../../../../../sanity.types";
import { LabResourcesEquipmentTable } from "./lab-resources-equipment-table";
import { LabResourcesTestCapabilitiesTable } from "./lab-resources-test-capabilities-table";
import { LabSectionForm } from "./lab-section-form";

export function LabUpdateResourcesForm({
  labId,
  equipment,
  services,
  assignedEquipmentIds,
  assignedTestCapabilityIds,
}: {
  labId: string;
  equipment: ALL_EQUIPMENT_QUERY_RESULT;
  services: ALL_SERVICES_QUERY_RESULT;
  assignedEquipmentIds: string[];
  assignedTestCapabilityIds: string[];
}) {
  return (
    <div className="space-y-8">
      <LabSectionForm
        title="Equipment"
        description="Instruments and apparatus housed in this laboratory"
        showFooter={false}
      >
        <LabResourcesEquipmentTable
          labId={labId}
          allEquipment={equipment}
          assignedIds={assignedEquipmentIds}
        />
      </LabSectionForm>

      <LabSectionForm
        title="Test Capabilities"
        description="Accredited test methods this laboratory can perform"
        showFooter={false}
      >
        <LabResourcesTestCapabilitiesTable
          labId={labId}
          allServices={services}
          assignedIds={assignedTestCapabilityIds}
        />
      </LabSectionForm>
    </div>
  );
}
