import { Form, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface SingleFieldProps {
  title: string;
  savable: boolean;
  fieldName: string;
  initialValue: any;
  onSubmit: (value: any) => Promise<void>;
  isSubmitting: boolean;
  validation?: z.ZodType<any, any>;
  renderField?: (form: ReturnType<typeof useForm>) => React.ReactNode; // <-- New renderField prop
}

export function SingleField({
  title,
  savable,
  fieldName,
  initialValue,
  onSubmit,
  isSubmitting,
  validation = z.string().min(1),
  renderField, // <-- Accept renderField prop
}: SingleFieldProps) {
  const schema = z.object({
    [fieldName]: validation,
  });

  const form = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    resolver: zodResolver(schema),
    defaultValues: {
      [fieldName]: initialValue,
    },
  });

  const formIsEdited = form.formState.isDirty;

  const handleFormSubmit = async (data: any) => {
    try {
      await onSubmit(data[fieldName]);
      form.reset(data); // reset to updated data if success
    } catch (error) {
      console.log(error);
      console.log("Error has been caught and form has been reset");
      form.reset(); // reset to original form data if error
    }
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-3"
      >
        {/* Use the renderField prop */}
        <div className="flex items-end flex-grow">
          <div className="flex-grow">{renderField && renderField(form)} </div>
          {savable && formIsEdited && (
            <div className="flex-grow-0">
              <div className="ml-4">
                <Button type="submit" disabled={isSubmitting || !formIsEdited}>
                  {isSubmitting ? (
                    <>
                      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        <span className="text-sm text-muted-foreground flex gap-2 flex-wrap">
          Learn about
          <a
            onClick={() =>
              toast("🧑‍🍳 In the kitchen...", {
                description:
                  "GIMS documentation is still in active development. Check back later",
              })
            }
            href={undefined}
            className="text-primary text-sm flex items-center hover:underline ml-1"
          >
            {title}
            <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        </span>
      </form>
    </FormProvider>
  );
}
