import { SingleFieldForm } from "@/components/single-field-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUpdateClientName } from "@/features/customer/clients/api/use-update-client-name";
import React, { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

interface ProjectUpdateClientNameFormProps {
  title: string;
  description?: string;
  learnMoreLink?: string;
  learnMoreText?: string;
  savable: boolean;
  fieldName: string;
  initialValue: string;
  clientId: string;
}

export default function ProjectUpdateClientNameForm({
  title,
  description,
  learnMoreLink,
  learnMoreText,
  savable,
  fieldName,
  initialValue,
  clientId,
}: ProjectUpdateClientNameFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutation } = useUpdateClientName();

  const handleUpdateClientName = async (name: string) => {
    setIsSubmitting(true);
    try {
      mutation.mutate({
        json: {
          clientId,
          clientName: name,
        },
      });

      toast("✅ Successful operation", {
        description: "Updated client name successfully",
      });
    } catch (error) {
      toast("⚠️ Uh Oh! Something went wrong", {
        description: "Client name was not updated",
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
      onSubmit={handleUpdateClientName}
      isSubmitting={isSubmitting}
      validation={z.string().trim().min(1, "Required")}
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
