"use client";

// Core
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { startTransition, useEffect } from "react";

// Icons
import { ArrowLeftCircle } from "lucide-react";

// Forms

// Components
import { FormSubmitButton } from "@/components/form-submit-button";

// Form schema
import { projectDetailsSchema } from "@/features/internal/projects/schemas";

import { ScrollToFieldError } from "@/components/scroll-to-field-error";
import { createProjectForClient } from "@/lib/actions";
import { useActionState } from "react";
import { ProjectDetailsForm } from "@/features/internal/projects/components/project-details-form";

const formVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50, transition: { ease: "easeOut" } },
};

export function CreateProjectForClientForm({ clientId }: { clientId: string }) {
  const router = useRouter();

  // Restored useActionState
  const [state, dispatch, isPending] = useActionState(
    createProjectForClient,
    null
  );

  const form = useForm<z.infer<typeof projectDetailsSchema>>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      projectName: "",
      internalId: `P${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000).toString()}`,
      dateRange: { from: undefined, to: undefined },
    },
  });

  const onSubmit = (data: z.infer<typeof projectDetailsSchema>) => {
    const formData = new FormData();
    formData.append("projectName", data.projectName);
    formData.append("internalId", data.internalId);
    // Check if dateRange.from exists and append it
    if (data.dateRange?.from && data.dateRange?.to) {
      formData.append("dateFrom", data.dateRange.from.toISOString());
      formData.append("dateTo", data.dateRange.to.toISOString());
    }
    formData.append("clientId", clientId);
    startTransition(() => dispatch(formData)); // Use dispatch instead of createProject
  };

  useEffect(() => {
    if (state?.status === "ok") {
      toast.success("Project created successfully");
      router.push(`/clients/${clientId}?tab=projects`);
    } else if (state?.status === "error") {
      toast.error("Something went wrong");
    }
  }, [state]);

  return (
    <>
      <Link
        className="mb-10 text-sm inline-flex tracking-tight underline underline-offset-4"
        href={`/clients/${clientId}?tab=projects`}
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
            <ProjectDetailsForm
              isSubmitting={isPending}
              formTitle="Create new project for client"
            />
          </motion.div>
          <FormSubmitButton text="Create Project" isSubmitting={isPending} />
        </form>
      </FormProvider>
    </>
  );
}
