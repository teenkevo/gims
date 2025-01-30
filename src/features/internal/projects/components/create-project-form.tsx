"use client";
// core
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { FormProvider, useForm } from "react-hook-form";
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

export function CreateProjectForm() {
  const { mutate } = useCreateProject();

  const router = useRouter();

  // Local loading state to handle both mutation and revalidation
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  //  handle form submission
  const handleCreateProject = (values: z.infer<typeof createProjectSchema>) => {
    mutate({
      json: values,
    });
  };

  const form = useForm<z.infer<typeof createProjectSchema>>({
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: zodResolver(createProjectSchema),
    defaultValues: formData,
  });

  return (
    <>
      <Link className="mb-5 inline-flex" href="/projects">
        <ArrowLeftCircle
          //   style={{ marginRight: "20px", marginBottom: "20px" }}
          className="mr-5 text-primary"
        />
        Go back
      </Link>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleCreateProject)}>
          <motion.div
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <ProjectDetailsForm isSubmitting={isSubmitting} />
            <ClientProfileForm isSubmitting={isSubmitting} />
          </motion.div>
          <FormSubmitButton text="Create Project" isSubmitting={isSubmitting} />
        </form>
      </FormProvider>
    </>
  );
}
