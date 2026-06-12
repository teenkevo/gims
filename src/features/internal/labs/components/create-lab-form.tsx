"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { startTransition, useActionState, useEffect } from "react";
import { ArrowLeftCircle } from "lucide-react";

import { ScrollToFieldError } from "@/components/scroll-to-field-error";
import { FormSubmitButton } from "@/components/form-submit-button";
import { createLab } from "@/lib/actions";
import {
  getCreateLabDefaultValues,
  type CreateLabIdentityValues,
} from "./lab-form-types";
import { LabIdentityForm } from "./lab-identity-form";

const formVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50, transition: { ease: "easeOut" } },
};

export function CreateLabForm() {
  const [state, dispatch, isPending] = useActionState(createLab, null);

  const form = useForm<CreateLabIdentityValues>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: getCreateLabDefaultValues(),
  });

  const onSubmit = (data: CreateLabIdentityValues) => {
    const formData = new FormData();
    formData.append("internalId", data.internalId);
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("labSection", data.labSection);
    formData.append("status", data.status);
    formData.append("location", data.location);
    formData.append("capacity", data.capacity);

    startTransition(() => dispatch(formData));
  };

  useEffect(() => {
    if (state?.status === "error") {
      toast.error(
        typeof state.error === "string" ? state.error : "Something went wrong"
      );
    }
  }, [state]);

  return (
    <>
      <Link
        className="mb-10 text-sm inline-flex tracking-tight underline underline-offset-4"
        href="/labs"
      >
        <ArrowLeftCircle className="mr-5 text-primary" />
        Go back
      </Link>
      <FormProvider {...form}>
        <ScrollToFieldError />
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <motion.div
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <LabIdentityForm
              isSubmitting={isPending}
              formTitle="Register laboratory"
            />
          </motion.div>
          <FormSubmitButton text="Register Laboratory" isSubmitting={isPending} />
        </form>
      </FormProvider>
    </>
  );
}
