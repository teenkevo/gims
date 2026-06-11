"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { startTransition, useActionState, useEffect } from "react";
import { ArrowLeftCircle } from "lucide-react";

import { ScrollToFieldError } from "@/components/scroll-to-field-error";
import { Card, CardContent } from "@/components/ui/card";
import { createEquipment } from "@/lib/actions";
import type { ALL_PERSONNEL_QUERY_RESULT } from "../../../../../sanity.types";
import {
  EQUIPMENT_CREATE_STEPS,
  getEquipmentFormDefaultValues,
  type EquipmentFormValues,
} from "./equipment-form-types";
import { EquipmentCreateStepIndicator } from "./equipment-create-step-indicator";
import { EquipmentFormNavigation } from "./equipment-form-navigation";
import { EquipmentIdentityStep } from "./create-equipment-steps/equipment-identity-step";
import { EquipmentAssignmentStep } from "./create-equipment-steps/equipment-assignment-step";
import { EquipmentVendorStep } from "./create-equipment-steps/equipment-vendor-step";

const stepVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40, transition: { ease: "easeOut" } },
};

function buildFormData(data: EquipmentFormValues) {
  const formData = new FormData();
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
  return formData;
}

export function CreateEquipmentForm({
  personnel,
}: {
  personnel: ALL_PERSONNEL_QUERY_RESULT;
}) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [state, dispatch, isPending] = useActionState(createEquipment, null);

  const form = useForm<EquipmentFormValues>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: getEquipmentFormDefaultValues(),
  });

  const totalSteps = EQUIPMENT_CREATE_STEPS.length;
  const activeStep = EQUIPMENT_CREATE_STEPS[currentStep - 1];

  const handleNext = async () => {
    const valid = await form.trigger([...activeStep.fields]);
    if (valid) {
      setCurrentStep((step) => Math.min(step + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      router.push("/equipment");
      return;
    }
    setCurrentStep((step) => step - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = (data: EquipmentFormValues) => {
    startTransition(() => dispatch(buildFormData(data)));
  };

  useEffect(() => {
    if (state?.status === "ok") {
      toast.success("Equipment registered successfully");
      router.push("/equipment");
    } else if (state?.status === "error") {
      toast.error("Something went wrong");
    }
  }, [state, router]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <EquipmentIdentityStep isSubmitting={isPending} showHeader={false} />
        );
      case 2:
        return (
          <EquipmentAssignmentStep
            personnel={personnel}
            isSubmitting={isPending}
            showHeader={false}
          />
        );
      case 3:
        return (
          <EquipmentVendorStep isSubmitting={isPending} showHeader={false} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full pb-24">
      <Link
        className="mb-8 text-sm inline-flex tracking-tight underline underline-offset-4"
        href="/equipment"
      >
        <ArrowLeftCircle className="mr-5 text-primary" />
        Go back
      </Link>

      <EquipmentCreateStepIndicator currentStep={currentStep} />

      <FormProvider {...form}>
        <ScrollToFieldError />
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="mt-6 border-dashed bg-card shadow-sm">
            <CardContent className="pt-6">
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
            </CardContent>
          </Card>

          <EquipmentFormNavigation
            currentStep={currentStep}
            totalSteps={totalSteps}
            isSubmitting={isPending}
            onBack={handleBack}
            onNext={handleNext}
          />
        </form>
      </FormProvider>
    </div>
  );
}
