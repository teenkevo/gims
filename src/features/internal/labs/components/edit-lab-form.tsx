"use client";

import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { startTransition, useActionState, useEffect } from "react";

import { FormSubmitButton } from "@/components/form-submit-button";
import { ScrollToFieldError } from "@/components/scroll-to-field-error";
import { updateLab } from "@/lib/actions";
import type {
  ALL_EQUIPMENT_QUERY_RESULT,
  ALL_PERSONNEL_QUERY_RESULT,
  ALL_SERVICES_QUERY_RESULT,
  LAB_BY_ID_QUERY_RESULT,
} from "../../../../../sanity.types";
import { LabFormFields } from "./lab-form-fields";
import type { LabFormValues } from "./lab-form-types";

export function EditLabForm({
  lab,
  personnel,
  equipment,
  services,
}: {
  lab: LAB_BY_ID_QUERY_RESULT[number];
  personnel: ALL_PERSONNEL_QUERY_RESULT;
  equipment: ALL_EQUIPMENT_QUERY_RESULT;
  services: ALL_SERVICES_QUERY_RESULT;
}) {
  const [state, dispatch, isPending] = useActionState(updateLab, null);

  const form = useForm<LabFormValues>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      internalId: lab.internalId ?? "",
      name: lab.name ?? "",
      description: lab.description ?? "",
      labSection: lab.labSection ?? "",
      status: lab.status ?? "available",
      location: lab.location ?? "",
      capacity: lab.capacity?.toString() ?? "",
      notes: lab.notes ?? "",
      personnelIds: (lab.personnel ?? []).map((p) => p._id),
      labHeadId: lab.labHead?._id ?? "",
      equipmentIds: (lab.equipment ?? []).map((e) => e._id),
      testCapabilityIds: (lab.testCapabilities ?? []).map((s) => s._id),
      accreditationStandard: lab.accreditation?.standard ?? "ISO 17025",
      accreditationCertificateNumber:
        lab.accreditation?.certificateNumber ?? "",
      accreditationAccreditingBody: lab.accreditation?.accreditingBody ?? "",
      accreditationExpiryDate: lab.accreditation?.expiryDate ?? "",
    },
  });

  const onSubmit = (data: LabFormValues) => {
    const formData = new FormData();
    formData.append("labId", lab._id);
    formData.append("internalId", data.internalId);
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("labSection", data.labSection);
    formData.append("status", data.status);
    formData.append("location", data.location);
    formData.append("capacity", data.capacity);
    formData.append("notes", data.notes);
    formData.append("labHeadId", data.labHeadId);
    formData.append("personnelIds", JSON.stringify(data.personnelIds));
    formData.append("equipmentIds", JSON.stringify(data.equipmentIds));
    formData.append("testCapabilityIds", JSON.stringify(data.testCapabilityIds));
    formData.append("accreditationStandard", data.accreditationStandard);
    formData.append(
      "accreditationCertificateNumber",
      data.accreditationCertificateNumber
    );
    formData.append(
      "accreditationAccreditingBody",
      data.accreditationAccreditingBody
    );
    formData.append("accreditationExpiryDate", data.accreditationExpiryDate);

    startTransition(() => dispatch(formData));
  };

  useEffect(() => {
    if (state?.status === "ok") {
      toast.success("Laboratory updated successfully");
    } else if (state?.status === "error") {
      toast.error(
        typeof state.error === "string"
          ? state.error
          : "Something went wrong"
      );
    }
  }, [state]);

  return (
    <FormProvider {...form}>
      <ScrollToFieldError />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-24">
        <LabFormFields
          personnel={personnel}
          equipment={equipment}
          services={services}
          isSubmitting={isPending}
        />
        <FormSubmitButton text="Save Changes" isSubmitting={isPending} />
      </form>
    </FormProvider>
  );
}
