import { SingleFieldForm } from "@/components/single-field-form";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import React, { useActionState, useState } from "react";
import { z } from "zod";
import { Control, FieldValues } from "react-hook-form";
import { updateClientName } from "@/lib/actions";
import { toastActionError } from "@/lib/auth/notify-action-error";

interface ClientUpdateNameFormProps {
  title: string;
  description?: string;
  learnMoreLink?: string;
  learnMoreText?: string;
  savable: boolean;
  fieldName: string;
  initialValue: string;
  clientId: string;
  unsavedChangesId?: string;
}

export default function ClientUpdateNameForm({
  title,
  description,
  learnMoreLink,
  learnMoreText,
  savable,
  fieldName,
  initialValue,
  clientId,
  unsavedChangesId,
}: ClientUpdateNameFormProps) {
  const action = async (_: void | null, formData: FormData) => {
    const result = await updateClientName(clientId, formData);
    if (result.status === "ok") {
      toast.success("Client name has been updated");
    } else {
      toastActionError(result);
    }
  };

  const [_, dispatch, isPending] = useActionState(action, null);

  return (
    <SingleFieldForm
      title={title}
      description={description}
      learnMoreLink={learnMoreLink}
      learnMoreText={learnMoreText}
      savable={savable}
      fieldName={fieldName}
      initialValue={initialValue}
      action={dispatch}
      isSubmitting={isPending}
      validation={z.string().trim().min(1, "Required")}
      unsavedChangesId={unsavedChangesId}
      renderField={(form, { editable }) => (
        <FormField
          control={form.control as Control<FieldValues, any, FieldValues>}
          name={fieldName}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  disabled={isPending || !editable}
                  {...field}
                  autoComplete="off"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    ></SingleFieldForm>
  );
}
