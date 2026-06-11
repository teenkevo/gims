import type { ALL_PERSONNEL_QUERY_RESULT } from "../../../../../sanity.types";
import { EquipmentIdentityStep } from "./create-equipment-steps/equipment-identity-step";
import { EquipmentAssignmentStep } from "./create-equipment-steps/equipment-assignment-step";
import { EquipmentVendorStep } from "./create-equipment-steps/equipment-vendor-step";

export type { EquipmentFormValues } from "./equipment-form-types";

export function EquipmentFormFields({
  personnel,
  isSubmitting,
}: {
  personnel: ALL_PERSONNEL_QUERY_RESULT;
  isSubmitting?: boolean;
}) {
  return (
    <div className="space-y-4">
      <EquipmentIdentityStep isSubmitting={isSubmitting} />
      <EquipmentAssignmentStep personnel={personnel} isSubmitting={isSubmitting} />
      <EquipmentVendorStep isSubmitting={isSubmitting} />
    </div>
  );
}
