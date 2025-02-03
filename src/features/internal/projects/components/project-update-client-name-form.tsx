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

    mutation.mutate(
      {
        json: {
          clientId,
          clientName: name,
        },
      },
      {
        onSuccess: () => {
          toast.success("Client name has been updated");
          setIsSubmitting(false);
        },
        onError: () => {
          toast.error("Something went wrong");
          setIsSubmitting(false);
        },
      }
    );
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
