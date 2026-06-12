"use client";

import { useActionState } from "react";
import { Control, FieldValues } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { SingleFieldForm } from "@/components/single-field-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updateLabName } from "@/lib/actions";

export function LabUpdateNameForm({
  initialValue,
  labId,
}: {
  initialValue: string;
  labId: string;
}) {
  const action = async (_: unknown, formData: FormData) => {
    const result = await updateLabName(formData, labId);
    if (result.status === "ok") {
      toast.success("Laboratory name has been updated");
    } else {
      toast.error("Something went wrong");
    }
    return result;
  };

  const [actionResult, dispatch, isPending] = useActionState(action, null);

  return (
    <SingleFieldForm
      title="Laboratory Name"
      description="Used to identify this laboratory in the system"
      savable
      fieldName="name"
      initialValue={initialValue}
      action={dispatch}
      actionResult={actionResult}
      isSubmitting={isPending}
      validation={z.string().trim().min(1, "Required")}
      renderField={(form) => (
        <FormField
          control={form.control as Control<FieldValues, unknown, FieldValues>}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input disabled={isPending} {...field} autoComplete="off" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    />
  );
}
