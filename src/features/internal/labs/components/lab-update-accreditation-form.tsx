"use client";

import { startTransition, useActionState, useEffect } from "react";
import { FormProvider, useForm, useFormState } from "react-hook-form";
import { toast } from "sonner";

import { updateLabAccreditation } from "@/lib/actions";
import { LabAccreditationStep } from "./create-lab-steps/lab-accreditation-step";
import { LabSectionForm } from "./lab-section-form";
import type { LabFormValues } from "./lab-form-types";

type AccreditationValues = Pick<
  LabFormValues,
  | "accreditationStandard"
  | "accreditationCertificateNumber"
  | "accreditationAccreditingBody"
  | "accreditationExpiryDate"
  | "notes"
>;

export function LabUpdateAccreditationForm({
  labId,
  initialValues,
}: {
  labId: string;
  initialValues: AccreditationValues;
}) {
  const action = async (_: unknown, formData: FormData) => {
    const result = await updateLabAccreditation(formData, labId);
    if (result.status === "ok") {
      toast.success("Accreditation details have been updated");
    } else {
      toast.error("Something went wrong");
    }
    return result;
  };

  const [actionResult, dispatch, isPending] = useActionState(action, null);

  const form = useForm<AccreditationValues>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: initialValues,
  });

  const { isDirty, errors } = useFormState({ control: form.control });

  useEffect(() => {
    if (actionResult?.status === "ok") {
      form.reset(form.getValues());
    }
  }, [actionResult, form]);

  const onSubmit = (data: AccreditationValues) => {
    const formData = new FormData();
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
    formData.append("notes", data.notes);
    startTransition(() => dispatch(formData));
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <LabSectionForm
          title="Accreditations"
          description="ISO 17025 details and operational notes"
          isSubmitting={isPending}
          isDirty={isDirty}
          hasError={Object.keys(errors).length > 0}
        >
          <LabAccreditationStep
            isSubmitting={isPending}
            showHeader={false}
          />
        </LabSectionForm>
      </form>
    </FormProvider>
  );
}
