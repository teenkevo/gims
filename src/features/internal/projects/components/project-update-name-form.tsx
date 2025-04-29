import { SingleFieldForm } from "@/components/single-field-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import React, { useState } from "react";
import { z } from "zod";
import { useUpdateProjectName } from "../api/use-update-project-name";
import { revalidateProject } from "@/lib/actions";
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutation } = useUpdateProjectName();

  const handleUpdateProjectName = async (name: any): Promise<void> => {
    setIsSubmitting(true);
    const result = await mutation.mutateAsync({
      json: {
        projectId,
        projectName: name,
      },
    });

    if (result) {
      revalidateProject(projectId).then(() => {
        toast.success("Project name has been updated");
        setIsSubmitting(false);
      });
    } else {
      toast.error("Something went wrong");
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
      onSubmit={handleUpdateProjectName}
      isSubmitting={isSubmitting}
      validation={z.string().trim().min(1, "Required")}
      renderField={(form) => (
        <FormField
          control={form.control as Control<FieldValues, any, FieldValues>}
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
