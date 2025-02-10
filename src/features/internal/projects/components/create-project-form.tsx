"use client";

// Core
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

// Icons
import { ArrowLeftCircle } from "lucide-react";

// Forms
import { ProjectDetailsForm } from "./project-details-form";
import { ClientProfileForm } from "./client-profile-form";

// Components
import { FormSubmitButton } from "@/components/form-submit-button";

// Form schema
import { createProjectSchema } from "@/features/internal/projects/schemas";

import { useCreateProject } from "../api/use-create-project";
import { ALL_CLIENTS_QUERYResult } from "../../../../../sanity.types";
import { ScrollToFieldError } from "@/components/scroll-to-field-error";

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
  const { mutation } = useCreateProject();

  const form = useForm<z.infer<typeof createProjectSchema>>({
    mode: "onChange",
    defaultValues: {
      projectName: "",
      dateRange: { from: undefined, to: undefined },
      priority: "noPriority",
      clients: [],
    },
  });

  const onSubmit = async (data: z.infer<typeof createProjectSchema>) => {
    // // Convert dates to ISO format
    // const formattedData = {
    //   ...data,
    //   dateRange: {
    //     from: data.dateRange.from.toISOString(),
    //     to: data.dateRange.to.toISOString(),
    //   },
    //   clients: data.clients.map((client) => ({
    //     clientType: client.clientType,
    //     clientId:
    //       client.clientType === "existing" ? client.existingClient : undefined,
    //     newClient:
    //       client.clientType === "new"
    //         ? { name: client.newClientName }
    //         : undefined,
    //   })),
    // };

    console.log(data);

    // mutation.mutate(
    //   { json: formattedData },
    //   {
    //     onSuccess: () => {
    //       router.push(`/projects`);
    //       toast.success("Project has been created");
    //     },
    //     onError: () => {
    //       toast.error("Something went wrong");
    //     },
    //   }
    // );
  };

  return (
    <>
      <Link className="mb-10 inline-flex" href="/projects">
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
            <ProjectDetailsForm isSubmitting={mutation.isPending} />
            <ClientProfileForm
              clients={clients}
              isSubmitting={mutation.isPending}
            />
          </motion.div>
          <FormSubmitButton
            text="Create Project"
            isSubmitting={mutation.isPending}
          />
        </form>
      </FormProvider>
    </>
  );
}
