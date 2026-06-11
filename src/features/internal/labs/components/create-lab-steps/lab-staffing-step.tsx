"use client";

import { useMemo } from "react";
import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ALL_PERSONNEL_QUERY_RESULT } from "../../../../../../sanity.types";
import { LabFormMultiSelect } from "../lab-form-multi-select";
import { LabStepContainer } from "../lab-step-container";
import type { LabFormValues } from "../lab-form-types";

export function LabStaffingStep({
  personnel,
  isSubmitting,
  showHeader = true,
}: {
  personnel: ALL_PERSONNEL_QUERY_RESULT;
  isSubmitting?: boolean;
  showHeader?: boolean;
}) {
  const form = useFormContext<LabFormValues>();
  const personnelIds = form.watch("personnelIds");

  const personnelOptions = personnel.map((p) => ({
    value: p._id,
    label: p.fullName ?? p.internalId ?? "Unknown",
    sublabel: p.internalId ?? undefined,
  }));

  const labHeadOptions = useMemo(
    () =>
      personnel
        .filter((p) => personnelIds.includes(p._id))
        .map((p) => ({
          value: p._id,
          label: p.fullName ?? p.internalId ?? "Unknown",
        })),
    [personnel, personnelIds]
  );

  return (
    <LabStepContainer showHeader={showHeader} step={2} title="Staffing">
      <FormField
        control={form.control}
        name="personnelIds"
        rules={{
          validate: (value) =>
            value.length > 0 || "At least one staff member is required",
        }}
        render={({ field }) => (
          <FormItem>
            <LabFormMultiSelect
              label="Assigned Personnel"
              description="Technicians and officers assigned to this laboratory"
              options={personnelOptions}
              selected={field.value}
              onChange={(values) => {
                field.onChange(values);
                const currentHead = form.getValues("labHeadId");
                if (currentHead && !values.includes(currentHead)) {
                  form.setValue("labHeadId", "");
                }
              }}
              disabled={isSubmitting}
              required
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="labHeadId"
        rules={{ required: "Lab head is required" }}
        render={({ field }) => (
          <FormItem>
            <FormLabel required>Lab Head</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={isSubmitting || labHeadOptions.length === 0}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      labHeadOptions.length === 0
                        ? "Assign personnel first"
                        : "Select lab head"
                    }
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {labHeadOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormDescription>
              Must be selected from assigned personnel
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </LabStepContainer>
  );
}
