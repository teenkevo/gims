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
import { revalidateProject } from "@/lib/actions";

interface ClientNameFormProps {
  title: string;
  savable: boolean;
  fieldName: string;
  initialValue: string;
  clientId: string;
  projectId: string;
}

export default function ClientNameForm({
  title,
  savable,
  fieldName,
  initialValue,
  clientId,
  projectId,
}: ClientNameFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutation } = useUpdateClientName();

  const handleUpdateClientName = async (name: any): Promise<void> => {
    setIsSubmitting(true);
    const result = await mutation.mutateAsync({
      json: {
        clientId,
        clientName: name,
      },
    });
    if (result) {
      toast.success("Client name has been updated");
      setIsSubmitting(false);
    } else {
      toast.error("Something went wrong");
      setIsSubmitting(false);
    }
  };

  return (
    <SingleField
      title={title}
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
    ></SingleField>
  );
}
