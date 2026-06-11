"use client";

import { Trash2 } from "lucide-react";
import { useFormContext } from "react-hook-form";

import FileUpload from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  const existingUserManuals = form.watch("existingUserManuals");

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
        {existingUserManuals.length > 0 && (
          <div className="space-y-2">
            <FormLabel>Uploaded Manuals</FormLabel>
            {existingUserManuals.map((manual) => (
              <div
                key={manual._key}
                className="flex items-center justify-between gap-2 rounded-md border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {manual.name || manual.asset?.originalFilename || "Manual"}
                  </p>
                  {manual.asset?.mimeType && (
                    <p className="text-xs text-muted-foreground">
                      {manual.asset.mimeType.toUpperCase()}
                      {manual.asset.size
                        ? ` • ${(manual.asset.size / (1024 * 1024)).toFixed(2)} MB`
                        : ""}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    form.setValue(
                      "existingUserManuals",
                      existingUserManuals.filter((m) => m._key !== manual._key)
                    );
                  }}
                  disabled={isSubmitting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <FormField
          control={form.control}
          name="userManualFiles"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User Manuals</FormLabel>
              <FormDescription>
                Upload equipment manuals (PDF, Word, or text files)
              </FormDescription>
              <FormControl>
                <FileUpload
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  maxSize={20}
                  onFilesChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </EquipmentStepContainer>
  );
}
