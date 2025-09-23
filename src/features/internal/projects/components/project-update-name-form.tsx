import { SingleFieldForm } from "@/components/single-field-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import React, { useActionState, useState } from "react";
import { z } from "zod";
import { useUpdateProjectName } from "../api/use-update-project-name";
import { revalidateProject, updateProjectName } from "@/lib/actions";
import { Control, FieldValues } from "react-hook-form";

interface ProjectUpdateNameFormProps {
  title: string;
  description?: string;
  learnMoreLink?: string;
  learnMoreText?: string;
  savable: boolean;
  fieldName: string;
  initialValue: string;
  projectId: string;
}

export default function ProjectUpdateNameForm({
  title,
  description,
  learnMoreLink,
  learnMoreText,
  savable,
  fieldName,
  initialValue,
  projectId,
}: ProjectUpdateNameFormProps) {
  const action = async (_: any, formData: FormData) => {
    const result = await updateProjectName(formData, projectId);
    if (result.status === "ok") {
      toast.success("Project name has been updated");
    } else {
      toast.error("Something went wrong");
    }
    return result;
  };

  const [actionResult, dispatch, isPending] = useActionState(action, null);

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
      actionResult={actionResult}
      isSubmitting={isPending}
      validation={z.string().trim().min(1, "Required")}
      renderField={(form) => (
        <FormField
          control={form.control as Control<FieldValues, any, FieldValues>}
          name={fieldName}
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
    ></SingleFieldForm>
  );
}
