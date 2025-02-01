"use client";
// core
import { useActionState, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Form, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

// icons
import { ArrowLeftCircle } from "lucide-react";

// forms
import { ProjectDetailsForm } from "./project-details-form";
import { ClientProfileForm } from "./client-profile-form";

// components
import { FormSubmitButton } from "@/components/form-submit-button";

// form schema
import { createProjectSchema } from "@/features/internal/projects/schemas";

import { useCreateProject } from "../api/use-create-project";
import { createProject } from "../server/actions";
import { ALL_CLIENTS_QUERYResult } from "../../../../../sanity.types";

const formVariants = {
  hidden: {
    opacity: 0,
    x: -50,
  },
  visible: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: 50,
    transition: {
      ease: "easeOut",
    },
  },
};

export function CreateProjectForm({
  clients,
}: {
  clients: ALL_CLIENTS_QUERYResult;
}) {
  const [_, action, isPending] = useActionState(createProject, null);

  const router = useRouter();

  const [formData] = useState<z.infer<typeof createProjectSchema>>({
    projectName: "",
    dateRange: {
      from: new Date(),
      to: new Date(),
    },
    clientType: "new",
    existingClient: undefined,
    newClientName: "",
    newClientEmail: "",
    newClientPhone: undefined,
  });

  const form = useForm<z.infer<typeof createProjectSchema>>({
    mode: "onChange",
    reValidateMode: "onSubmit",
    resolver: zodResolver(createProjectSchema),
    defaultValues: formData,
  });

  const onSubmit = form.handleSubmit(
    (data: z.infer<typeof createProjectSchema>) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (
          key === "dateRange" &&
          typeof value === "object" &&
          value !== null
        ) {
          formData.append("dateFrom", value.from.toISOString());
          formData.append("dateTo", value.to.toISOString());
        } else {
          formData.append(key, value as string);
        }
      });

      startTransition(() => {
        action(formData);
      });
    }
  );

  return (
    <>
      <Link className="mb-10 inline-flex" href="/projects">
        <ArrowLeftCircle className="mr-5 text-primary" />
        Go back
      </Link>
      <FormProvider {...form}>
        <form action={action} onSubmit={onSubmit}>
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
