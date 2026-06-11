"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { startTransition, useActionState } from "react";
import { ArrowLeftCircle } from "lucide-react";

import { ScrollToFieldError } from "@/components/scroll-to-field-error";
import { createLab } from "@/lib/actions";
import type {
  ALL_EQUIPMENT_QUERY_RESULT,
  ALL_PERSONNEL_QUERY_RESULT,
  ALL_SERVICES_QUERY_RESULT,
} from "../../../../../sanity.types";
import {
  LAB_CREATE_STEPS,
  getLabFormDefaultValues,
  type LabFormValues,
} from "./lab-form-types";
import { LabCreateStepIndicator } from "./lab-create-step-indicator";
import { LabFormNavigation } from "./lab-form-navigation";
import { LabIdentityStep } from "./create-lab-steps/lab-identity-step";
import { LabStaffingStep } from "./create-lab-steps/lab-staffing-step";
import { LabResourcesStep } from "./create-lab-steps/lab-resources-step";
import { LabAccreditationStep } from "./create-lab-steps/lab-accreditation-step";

const stepVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40, transition: { ease: "easeOut" } },
};

function buildFormData(data: LabFormValues) {
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
  return formData;
}

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
  const [currentStep, setCurrentStep] = useState(1);
  const [state, dispatch, isPending] = useActionState(createLab, null);

  const form = useForm<LabFormValues>({
    mode: "onChange",
    reValidateMode: "onChange",
    shouldUnregister: false,
    defaultValues: getLabFormDefaultValues(),
  });

  const totalSteps = LAB_CREATE_STEPS.length;
  const activeStep = LAB_CREATE_STEPS[currentStep - 1];

  const handleNext = async () => {
    const valid = await form.trigger([...activeStep.fields]);
    if (valid) {
      setCurrentStep((step) => Math.min(step + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      router.push("/labs");
      return;
    }
    setCurrentStep((step) => step - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const registerLab = async () => {
    const allFields = LAB_CREATE_STEPS.flatMap((step) => [...step.fields]);
    const valid = await form.trigger(allFields);
    if (!valid) return;

    startTransition(() => dispatch(buildFormData(form.getValues())));
  };

  const handlePrimaryAction = async () => {
    if (currentStep < totalSteps) {
      await handleNext();
      return;
    }

    await registerLab();
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  useEffect(() => {
    if (state?.status === "error") {
      toast.error(
        typeof state.error === "string" ? state.error : "Something went wrong"
      );
    }
  }, [state]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <LabIdentityStep isSubmitting={isPending} showHeader={false} />;
      case 2:
        return (
          <LabStaffingStep
            personnel={personnel}
            isSubmitting={isPending}
            showHeader={false}
          />
        );
      case 3:
        return (
          <LabResourcesStep
            equipment={equipment}
            services={services}
            isSubmitting={isPending}
            showHeader={false}
          />
        );
      case 4:
        return (
          <LabAccreditationStep isSubmitting={isPending} showHeader={false} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full pb-24">
      <Link
        className="mb-8 text-sm inline-flex tracking-tight underline underline-offset-4"
        href="/labs"
      >
        <ArrowLeftCircle className="mr-5 text-primary" />
        Go back
      </Link>

      <LabCreateStepIndicator currentStep={currentStep} />

      <FormProvider {...form}>
        <ScrollToFieldError />
        <form onSubmit={handleFormSubmit}>
          <div className="mt-6 border border-border bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.2 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>

          <LabFormNavigation
            currentStep={currentStep}
            totalSteps={totalSteps}
            isSubmitting={isPending}
            onBack={handleBack}
            onPrimaryAction={() => void handlePrimaryAction()}
          />
        </form>
      </FormProvider>
    </div>
  );
}
