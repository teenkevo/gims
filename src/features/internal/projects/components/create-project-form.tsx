"use client";

// Core
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { createProjectFormSchema } from "@/features/internal/projects/schemas";

import { ALL_CLIENTS_QUERY_RESULT } from "../../../../../sanity.types";
import { ScrollToFieldError } from "@/components/scroll-to-field-error";
import { createProject } from "@/lib/actions";
import { useActionState } from "react";
import { toastActionError } from "@/lib/auth/notify-action-error";
import { useRBAC } from "@/components/rbac-context";
import { PERMISSIONS } from "@/lib/auth/permissions";

const formVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50, transition: { ease: "easeOut" } },
};

export function CreateProjectForm({
  clients,
  labId,
}: {
  clients: ALL_CLIENTS_QUERY_RESULT;
  labId?: string;
}) {
  const router = useRouter();
  const { can } = useRBAC();
  const canCreateClient = can(PERMISSIONS["clients:create"]);

  // Restored useActionState
  const [state, dispatch, isPending] = useActionState(createProject, null);

  const form = useForm<z.infer<typeof createProjectFormSchema>>({
    resolver: zodResolver(createProjectFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      projectName: "",
      internalId: `P${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000).toString()}`,
      dateRange: { from: undefined, to: undefined },
      clients: [
        {
          clientType: canCreateClient ? "new" : "existing",
          existingClient: "",
          newClientName: "",
          newClientInternalId: `C-${Math.floor(10000 + Math.random() * 90000).toString()}`,
        },
      ],
    },
  });

  const {
    formState: { isValid },
  } = form;

  const onSubmit = (data: z.infer<typeof createProjectFormSchema>) => {
    const formData = new FormData();
    formData.append("projectName", data.projectName);
    formData.append("internalId", data.internalId);
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
          newClientInternalId:
            client.clientType === "new"
              ? client.newClientInternalId
              : undefined,
        })
      )
    );

    if (labId) {
      formData.append("labId", labId);
    }

    startTransition(() => dispatch(formData)); // Use dispatch instead of createProject
  };

  useEffect(() => {
    if (state?.status === "ok") {
      toast.success("Project created successfully");
      if (labId) {
        router.push(`/labs/${labId}?tab=projects`);
      } else {
        router.push("/projects");
      }
    } else if (state?.status === "error") {
      toastActionError(state);
    }
  }, [state, labId, router]);

  return (
    <>
      <Link
        className="mb-10 text-sm inline-flex tracking-tight underline underline-offset-4"
        href={labId ? `/labs/${labId}?tab=projects` : "/projects"}
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
              formTitle="Create new project"
            />
            <ClientProfileForm
              clients={clients}
              isSubmitting={isPending}
              canCreateClient={canCreateClient}
            />
          </motion.div>
          <FormSubmitButton
            text="Create Project"
            isSubmitting={isPending}
            disabled={!isValid}
          />
        </form>
      </FormProvider>
    </>
  );
}
