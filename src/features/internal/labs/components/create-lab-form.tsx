"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { startTransition, useActionState, useEffect } from "react";
import { ArrowLeftCircle } from "lucide-react";

import { FormSubmitButton } from "@/components/form-submit-button";
import { ScrollToFieldError } from "@/components/scroll-to-field-error";
import { createLab } from "@/lib/actions";
import type {
  ALL_EQUIPMENT_QUERY_RESULT,
  ALL_PERSONNEL_QUERY_RESULT,
  ALL_SERVICES_QUERY_RESULT,
} from "../../../../../sanity.types";
import { LabFormFields, type LabFormValues } from "./lab-form-fields";

const formVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50, transition: { ease: "easeOut" } },
};

export function CreateLabForm({
  personnel,
  equipment,
  services,
}: {
  personnel: ALL_PERSONNEL_QUERY_RESULT;
  equipment: ALL_EQUIPMENT_QUERY_RESULT;
  services: ALL_SERVICES_QUERY_RESULT;
}) {
  const router = useRouter();
  const [state, dispatch, isPending] = useActionState(createLab, null);

  const form = useForm<LabFormValues>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      internalId: `LAB-${Math.floor(10000 + Math.random() * 90000).toString()}`,
      name: "",
      description: "",
      labSection: "",
      status: "available",
      location: "",
      capacity: "",
      notes: "",
      personnelIds: [],
      labHeadId: "",
      equipmentIds: [],
      testCapabilityIds: [],
      accreditationStandard: "ISO 17025",
      accreditationCertificateNumber: "",
      accreditationAccreditingBody: "",
      accreditationExpiryDate: "",
    },
  });

  const onSubmit = (data: LabFormValues) => {
    const formData = new FormData();
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
      toast.success("Laboratory registered successfully");
      router.push("/labs");
    } else if (state?.status === "error") {
      toast.error(
        typeof state.error === "string"
          ? state.error
          : "Something went wrong"
      );
    }
  }, [state, router]);

  return (
    <>
      <Link
        className="mb-10 text-sm inline-flex tracking-tight underline underline-offset-4"
        href="/labs"
      >
        <ArrowLeftCircle className="mr-5 text-primary" />
        Go back
      </Link>
      <h1 className="text-xl md:text-3xl font-extrabold mb-6">
        Register Laboratory
      </h1>
      <FormProvider {...form}>
        <ScrollToFieldError />
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <motion.div
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <LabFormFields
              form={form}
              personnel={personnel}
              equipment={equipment}
              services={services}
              isSubmitting={isPending}
            />
          </motion.div>
          <FormSubmitButton
            text="Register Laboratory"
            isSubmitting={isPending}
          />
        </form>
      </FormProvider>
    </>
  );
}
