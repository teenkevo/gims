"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ALL_PERSONNEL_QUERY_RESULT } from "../../../../../sanity.types";
import { updateLabHead } from "@/lib/actions";
import { LabStaffingPersonnelTable } from "./lab-staffing-personnel-table";
import { LabSectionForm } from "./lab-section-form";

export function LabUpdateStaffingForm({
  labId,
  personnel,
  assignedIds,
  labHeadId,
}: {
  labId: string;
  personnel: ALL_PERSONNEL_QUERY_RESULT;
  assignedIds: string[];
  labHeadId: string;
}) {
  const router = useRouter();

  const labHeadOptions = useMemo(
    () =>
      personnel
        .filter((person) => assignedIds.includes(person._id))
        .map((person) => ({
          value: person._id,
          label: person.fullName ?? person.internalId ?? "Unknown",
        })),
    [personnel, assignedIds]
  );

  const handleLabHeadChange = (value: string) => {
    void (async () => {
      const result = await updateLabHead(labId, value);
      if (result.status === "ok") {
        toast.success("Lab head updated");
        router.refresh();
      } else {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Something went wrong"
        );
      }
    })();
  };

  return (
    <LabSectionForm
      title="Staffing"
      description="Assign personnel and designate the lab head"
      showFooter={false}
    >
      <div className="space-y-10">
        <div>
          <Label className="mb-5 block after:ml-0.5 after:text-destructive after:content-['*']">
            Assigned Personnel
          </Label>
          <LabStaffingPersonnelTable
            labId={labId}
            allPersonnel={personnel}
            assignedIds={assignedIds}
          />
        </div>

        <div className="space-y-2">
          <Label className="after:ml-0.5 after:text-destructive after:content-['*']">
            Lab Head
          </Label>
          <Select
            onValueChange={handleLabHeadChange}
            value={labHeadId || undefined}
            disabled={labHeadOptions.length === 0}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  labHeadOptions.length === 0
                    ? "Assign personnel first"
                    : "Select lab head"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {labHeadOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[0.8rem] text-muted-foreground">
            Must be selected from assigned personnel. Changes are saved
            immediately.
          </p>
        </div>
      </div>
    </LabSectionForm>
  );
}
