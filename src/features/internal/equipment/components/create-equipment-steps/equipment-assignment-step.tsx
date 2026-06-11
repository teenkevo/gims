"use client";

import { Plus, Trash2 } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { ALL_PERSONNEL_QUERY_RESULT } from "../../../../../../sanity.types";
import { LabFormMultiSelect } from "@/features/internal/labs/components/lab-form-multi-select";
import { EquipmentStepContainer } from "../equipment-step-container";
import type { EquipmentFormValues } from "../equipment-form-types";

export function EquipmentAssignmentStep({
  personnel,
  isSubmitting,
  showHeader = true,
}: {
  personnel: ALL_PERSONNEL_QUERY_RESULT;
  isSubmitting?: boolean;
  showHeader?: boolean;
}) {
  const form = useFormContext<EquipmentFormValues>();
  const userManualUrls = form.watch("userManualUrls");

  const personnelOptions = personnel.map((p) => ({
    value: p._id,
    label: p.fullName ?? p.internalId ?? "Unknown",
    sublabel: p.internalId ?? undefined,
  }));

  return (
    <EquipmentStepContainer
      showHeader={showHeader}
      step={2}
      title="Assignment & Manuals"
    >
      <FormField
        control={form.control}
        name="personnelIds"
        render={({ field }) => (
          <FormItem>
            <LabFormMultiSelect
              label="Assigned Personnel"
              description="Technicians responsible for operating or maintaining this equipment"
              options={personnelOptions}
              selected={field.value}
              onChange={field.onChange}
              disabled={isSubmitting}
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-3">
        <FormLabel>User Manuals</FormLabel>
        {userManualUrls.map((_, index) => (
          <FormField
            key={index}
            control={form.control}
            name={`userManualUrls.${index}`}
            render={({ field }) => (
              <FormItem>
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://..."
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  {userManualUrls.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const next = userManualUrls.filter((_, i) => i !== index);
                        form.setValue("userManualUrls", next.length ? next : [""]);
                      }}
                      disabled={isSubmitting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            form.setValue("userManualUrls", [...userManualUrls, ""])
          }
          disabled={isSubmitting}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add manual link
        </Button>
      </div>
    </EquipmentStepContainer>
  );
}
