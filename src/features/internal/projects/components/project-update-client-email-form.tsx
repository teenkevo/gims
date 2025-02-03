import { SingleFieldForm } from "@/components/single-field-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUpdateClientEmail } from "@/features/customer/clients/api/use-update-client-email";
import React, { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

interface ProjectUpdateClientEmailFormProps {
  title: string;
  description?: string;
  learnMoreLink?: string;
  learnMoreText?: string;
  savable: boolean;
  fieldName: string;
  initialValue: string;
  clientId: string;
}

export default function ProjectUpdateClientEmailForm({
  title,
  description,
  learnMoreLink,
  learnMoreText,
  savable,
  fieldName,
  initialValue,
  clientId,
}: ProjectUpdateClientEmailFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutation } = useUpdateClientEmail();

  const handleUpdateClientEmail = async (email: string) => {
    setIsSubmitting(true);
    try {
      mutation.mutate({
        json: {
          clientId,
          clientEmail: email,
        },
      });
      toast("✅ Successful operation", {
        description: "Updated client email successfully",
      });
    } catch (error) {
      toast("⚠️ Uh Oh! Something went wrong", {
        description: "Client email was not updated",
      });

      throw new Error("Error in mutation response"); // this error is caught in the handleForm submit of Single Field Form
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SingleFieldForm
      title={title}
      description={description}
      learnMoreLink={learnMoreLink}
      learnMoreText={learnMoreText}
      savable={savable}
      fieldName={fieldName}
      initialValue={initialValue}
      onSubmit={handleUpdateClientEmail}
      isSubmitting={isSubmitting}
      validation={z
        .string()
        .email({ message: "Enter valid email" })
        .min(1, "Required")}
      renderField={(form) => (
        <FormField
          control={form.control}
          name={fieldName}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input disabled={isSubmitting} {...field} autoComplete="off" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    ></SingleFieldForm>
  );
}
