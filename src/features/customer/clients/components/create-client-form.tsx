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
import { ClientProfileForm } from "./client-profile-form";

// Components
import { FormSubmitButton } from "@/components/form-submit-button";

import type { ALL_CLIENTS_QUERYResult } from "../../../../../sanity.types";
import { ScrollToFieldError } from "@/components/scroll-to-field-error";
import { createClient } from "@/lib/actions";
import { useActionState } from "react";
import { randomUUID } from "crypto";

const formVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50, transition: { ease: "easeOut" } },
};

export function CreateClientForm({
  clients,
}: {
  clients: ALL_CLIENTS_QUERYResult;
}) {
  const router = useRouter();

  // Restored useActionState
  const [state, dispatch, isPending] = useActionState(createClient, null);

  const form = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      internalId: `C-${Math.floor(10000 + Math.random() * 90000).toString()}`,
      clientName: "",
    },
  });

  const onSubmit = (data: any) => {
    const formData = new FormData();

    formData.append("internalId", data.internalId);
    formData.append("clientName", data.clientName);

    startTransition(() => dispatch(formData));
  };

  useEffect(() => {
    if (state?.status === "ok") {
      toast.success("Client added successfully");
      router.push("/clients");
    } else if (state?.status === "error") {
      toast.error("Something went wrong");
    }
  }, [state, router]);

  return (
    <>
      <Link
        className="mb-10 text-sm inline-flex tracking-tight underline underline-offset-4"
        href="/clients"
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
            <ClientProfileForm clients={clients} isSubmitting={isPending} />
          </motion.div>
          <FormSubmitButton text="Add Client" isSubmitting={isPending} />
        </form>
      </FormProvider>
    </>
  );
}
