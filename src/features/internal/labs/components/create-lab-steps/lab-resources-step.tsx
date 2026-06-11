"use client";

import { useFormContext } from "react-hook-form";

import {
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import type {
  ALL_EQUIPMENT_QUERY_RESULT,
  ALL_SERVICES_QUERY_RESULT,
} from "../../../../../../sanity.types";
import { LabFormMultiSelect } from "../lab-form-multi-select";
import { LabStepContainer } from "../lab-step-container";
import type { LabFormValues } from "../lab-form-types";

export function LabResourcesStep({
  equipment,
  services,
  isSubmitting,
  showHeader = true,
}: {
  equipment: ALL_EQUIPMENT_QUERY_RESULT;
  services: ALL_SERVICES_QUERY_RESULT;
  isSubmitting?: boolean;
  showHeader?: boolean;
}) {
  const form = useFormContext<LabFormValues>();

  const equipmentOptions = equipment.map((e) => ({
    value: e._id,
    label: e.name ?? "Unknown",
    sublabel: e.serialNumber ?? undefined,
  }));

  const serviceOptions = services.map((s) => ({
    value: s._id,
    label: s.testParameter ?? s.code ?? "Unknown test",
    sublabel: s.code ?? undefined,
  }));

  return (
    <LabStepContainer
      showHeader={showHeader}
      step={3}
      title="Resources & Capabilities"
    >
      <FormField
        control={form.control}
        name="equipmentIds"
        render={({ field }) => (
          <FormItem>
            <LabFormMultiSelect
              label="Equipment"
              description="Instruments and apparatus housed in this laboratory"
              options={equipmentOptions}
              selected={field.value}
              onChange={field.onChange}
              disabled={isSubmitting}
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="testCapabilityIds"
        render={({ field }) => (
          <FormItem>
            <LabFormMultiSelect
              label="Test Capabilities"
              description="Accredited test methods this laboratory can perform"
              options={serviceOptions}
              selected={field.value}
              onChange={field.onChange}
              disabled={isSubmitting}
            />
            <FormMessage />
          </FormItem>
        )}
      />
    </LabStepContainer>
  );
}
