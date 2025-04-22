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
import { ProjectDetailsForm } from "./project-details-form";
import { ClientProfileForm } from "./client-profile-form";

// Components
import { FormSubmitButton } from "@/components/form-submit-button";

// Form schema
import { createProjectSchema } from "@/features/internal/projects/schemas";

import { ALL_CLIENTS_QUERYResult } from "../../../../../sanity.types";
import { ScrollToFieldError } from "@/components/scroll-to-field-error";
import { createProject } from "@/lib/actions";
import { useActionState } from "react";

const formVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50, transition: { ease: "easeOut" } },
};

export function CreateProjectForm({
  clients,
}: {
  clients: ALL_CLIENTS_QUERYResult;
}) {
  const router = useRouter();

  // Restored useActionState
  const [state, dispatch, isPending] = useActionState(createProject, null);

  const form = useForm<z.infer<typeof createProjectSchema>>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      projectName: "",
      dateRange: { from: undefined, to: undefined },
      clients: [],
    },
  });

  const onSubmit = (data: z.infer<typeof createProjectSchema>) => {
    console.log(data);
    const formData = new FormData();
    formData.append("projectName", data.projectName);

    // Check if dateRange.from exists and append it
    if (data.dateRange?.from && data.dateRange?.to) {
      formData.append("dateFrom", data.dateRange.from.toISOString());
      formData.append("dateTo", data.dateRange.to.toISOString());
    }

    data.clients.forEach((client) =>
      formData.append(
        "clients",
        JSON.stringify({
          clientType: client.clientType,
          existingClient:
            client.clientType === "existing"
              ? client.existingClient
              : undefined,
          newClientName:
            client.clientType === "new" ? client.newClientName : undefined,
        })
      )
    );

    startTransition(() => dispatch(formData)); // Use dispatch instead of createProject
  };

  useEffect(() => {
    if (state?.status === "ok") {
      toast.success("Project created successfully");
      router.push("/projects");
    } else if (state?.status === "error") {
      toast.error("Something went wrong");
    }
  }, [state]);

  return (
    <>
      <Link
        className="mb-10 inline-flex tracking-tight underline underline-offset-4"
        href="/projects"
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
            <ProjectDetailsForm isSubmitting={isPending} />
            <ClientProfileForm clients={clients} isSubmitting={isPending} />
          </motion.div>
          <FormSubmitButton text="Create Project" isSubmitting={isPending} />
        </form>
      </FormProvider>
    </>
  );
}
