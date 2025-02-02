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
import { client } from "@/lib/rpc";

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
  const router = useRouter();

  const { mutate } = useCreateProject();

  const [formData] = useState<z.infer<typeof createProjectSchema>>({
    projectName: "",
    dateRange: {
      from: new Date(),
      to: new Date(),
    },
    priority: "noPriority",
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

  const onSubmit = async (data: z.infer<typeof createProjectSchema>) => {
    // Convert Date objects to ISO strings
    const formattedData = {
      ...data,
      dateRange: {
        from: data.dateRange.from.toISOString(),
        to: data.dateRange.to.toISOString(),
      },
    };
    mutate({ json: formattedData });
  };

  return (
    <>
      <Link className="mb-10 inline-flex" href="/projects">
        <ArrowLeftCircle className="mr-5 text-primary" />
        Go back
      </Link>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <motion.div
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <ProjectDetailsForm isSubmitting={false} />
            <ClientProfileForm clients={clients} isSubmitting={false} />
          </motion.div>
          <FormSubmitButton text="Create Project" isSubmitting={false} />
        </form>
      </FormProvider>
    </>
  );
}
