"use client";

import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { startTransition, useActionState, useEffect, useState } from "react";

import { FormSubmitButton } from "@/components/form-submit-button";
import { ScrollToFieldError } from "@/components/scroll-to-field-error";
import { updateEquipment } from "@/lib/actions";
import type {
  ALL_PERSONNEL_QUERY_RESULT,
  EQUIPMENT_BY_ID_QUERY_RESULT,
} from "../../../../../sanity.types";
import { EquipmentFormFields } from "./equipment-form-fields";
import type {
  EquipmentFormValues,
  EquipmentUserManual,
} from "./equipment-form-types";
import { appendUserManualUploads } from "./equipment-user-manual-upload";

function isEquipmentUserManual(value: unknown): value is EquipmentUserManual {
  return (
    typeof value === "object" &&
    value !== null &&
    "_key" in value &&
    typeof (value as EquipmentUserManual)._key === "string"
  );
}

export function EditEquipmentForm({
  item,
  personnel,
}: {
  item: EQUIPMENT_BY_ID_QUERY_RESULT[number];
  personnel: ALL_PERSONNEL_QUERY_RESULT;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [state, dispatch, isPending] = useActionState(updateEquipment, null);

  const form = useForm<EquipmentFormValues>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      internalId: item.internalId ?? "",
      name: item.name ?? "",
      serialNumber: item.serialNumber ?? "",
      category: item.category ?? "",
      manufacturer: item.manufacturer ?? "",
      model: item.model ?? "",
      status: item.status ?? "available",
      notes: item.notes ?? "",
      lastMaintenance: item.lastMaintenance ?? "",
      nextMaintenance: item.nextMaintenance ?? "",
      personnelIds: (item.assignedPersonnel ?? []).map((p) => p._id),
      userManualFiles: [],
      existingUserManuals: (item.userManuals ?? []).filter(isEquipmentUserManual),
      supplierName: item.supplier?.name ?? "",
      supplierContactPerson: item.supplier?.contactPerson ?? "",
      supplierContactEmail: item.supplier?.contactEmail ?? "",
      supplierContactPhone: item.supplier?.contactPhone ?? "",
      maintenanceCompanyName: item.maintenanceCompany?.companyName ?? "",
      maintenanceContactPerson: item.maintenanceCompany?.contactPerson ?? "",
      maintenanceContactEmail: item.maintenanceCompany?.contactEmail ?? "",
      maintenanceContactPhone: item.maintenanceCompany?.contactPhone ?? "",
    },
  });

  const onSubmit = async (data: EquipmentFormValues) => {
    const formData = new FormData();
    formData.append("equipmentId", item._id);
    formData.append("internalId", data.internalId);
    formData.append("name", data.name);
    formData.append("serialNumber", data.serialNumber);
    formData.append("category", data.category);
    formData.append("manufacturer", data.manufacturer);
    formData.append("model", data.model);
    formData.append("status", data.status);
    formData.append("notes", data.notes);
    formData.append("lastMaintenance", data.lastMaintenance);
    formData.append("nextMaintenance", data.nextMaintenance);
    formData.append("personnelIds", JSON.stringify(data.personnelIds));
    formData.append(
      "existingUserManuals",
      JSON.stringify(
        data.existingUserManuals.map((manual) => ({
          _key: manual._key,
          assetId: manual.asset?._id,
          name: manual.name || manual.asset?.originalFilename,
        }))
      )
    );
    formData.append("supplierName", data.supplierName);
    formData.append("supplierContactPerson", data.supplierContactPerson);
    formData.append("supplierContactEmail", data.supplierContactEmail);
    formData.append("supplierContactPhone", data.supplierContactPhone);
    formData.append("maintenanceCompanyName", data.maintenanceCompanyName);
    formData.append("maintenanceContactPerson", data.maintenanceContactPerson);
    formData.append("maintenanceContactEmail", data.maintenanceContactEmail);
    formData.append("maintenanceContactPhone", data.maintenanceContactPhone);

    setIsUploading(true);
    const uploaded = await appendUserManualUploads(
      formData,
      data.userManualFiles
    );
    setIsUploading(false);

    if (!uploaded) {
      toast.error("Failed to upload user manuals");
      return;
    }

    startTransition(() => dispatch(formData));
  };

  useEffect(() => {
    if (state?.status === "ok") {
      toast.success("Equipment updated successfully");
    } else if (state?.status === "error") {
      toast.error("Something went wrong");
    }
  }, [state]);

  return (
    <FormProvider {...form}>
      <ScrollToFieldError />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-24">
        <EquipmentFormFields
          personnel={personnel}
          isSubmitting={isPending || isUploading}
        />
        <FormSubmitButton
          text="Save Changes"
          isSubmitting={isPending || isUploading}
        />
      </form>
    </FormProvider>
  );
}
