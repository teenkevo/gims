"use client";

import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { startTransition, useActionState, useEffect } from "react";

import { FormSubmitButton } from "@/components/form-submit-button";
import { ScrollToFieldError } from "@/components/scroll-to-field-error";
import { updateEquipment } from "@/lib/actions";
import type {
  ALL_PERSONNEL_QUERY_RESULT,
  EQUIPMENT_BY_ID_QUERY_RESULT,
} from "../../../../../sanity.types";
import { EquipmentFormFields } from "./equipment-form-fields";
import type { EquipmentFormValues } from "./equipment-form-types";

export function EditEquipmentForm({
  item,
  personnel,
}: {
  item: EQUIPMENT_BY_ID_QUERY_RESULT[number];
  personnel: ALL_PERSONNEL_QUERY_RESULT;
}) {
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
      userManualUrls:
        item.userManuals && item.userManuals.length > 0
          ? item.userManuals
          : [""],
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

  const onSubmit = (data: EquipmentFormValues) => {
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
      "userManualUrls",
      JSON.stringify(data.userManualUrls.filter(Boolean))
    );
    formData.append("supplierName", data.supplierName);
    formData.append("supplierContactPerson", data.supplierContactPerson);
    formData.append("supplierContactEmail", data.supplierContactEmail);
    formData.append("supplierContactPhone", data.supplierContactPhone);
    formData.append("maintenanceCompanyName", data.maintenanceCompanyName);
    formData.append("maintenanceContactPerson", data.maintenanceContactPerson);
    formData.append("maintenanceContactEmail", data.maintenanceContactEmail);
    formData.append("maintenanceContactPhone", data.maintenanceContactPhone);

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
        <EquipmentFormFields personnel={personnel} isSubmitting={isPending} />
        <FormSubmitButton text="Save Changes" isSubmitting={isPending} />
      </form>
    </FormProvider>
  );
}
