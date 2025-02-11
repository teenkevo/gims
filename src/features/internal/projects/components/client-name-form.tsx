import { SingleFieldForm } from "@/components/single-field-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import React, { useState } from "react";
import { z } from "zod";
import { useUpdateProjectName } from "../api/use-update-project-name";
import { useUpdateClientName } from "@/features/customer/clients/api/use-update-client-name";
import { SingleField } from "./singleField";

interface ClientNameFormProps {
  title: string;
  savable: boolean;
  fieldName: string;
  initialValue: string;
  clientId: string;
}

export default function ClientNameForm({
  title,
  savable,
  fieldName,
  initialValue,
  clientId,
}: ClientNameFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutation } = useUpdateClientName();

  const handleUpdateProjectName = async (name: any): Promise<void> => {
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
    <SingleField
      title={title}
      savable={savable}
      fieldName={fieldName}
      initialValue={initialValue}
      onSubmit={handleUpdateProjectName}
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
    ></SingleField>
  );
}
