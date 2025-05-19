import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ExternalLink } from "lucide-react";
import { Form } from "./ui/form";
import { toast } from "sonner";

interface SingleFieldFormProps {
  title: string;
  description?: string;
  learnMoreLink?: string;
  learnMoreText?: string;
  savable: boolean;
  fieldName: string;
  initialValue: any;
  onSubmit?: (value: any) => Promise<void>;
  isSubmitting: boolean;
  validation?: z.ZodType<any, any>;
  renderField?: (form: ReturnType<typeof useForm>) => React.ReactNode; // <-- New renderField prop
  action?: string | ((formData: FormData) => void | Promise<void>); // <-- Optional action prop
}

export function SingleFieldForm({
  title,
  description,
  learnMoreLink,
  savable,
  fieldName,
  initialValue,
  onSubmit,
  isSubmitting,
  validation = z.string().min(1),
  renderField, // <-- Accept renderField prop
  action, // <-- Accept action prop
}: SingleFieldFormProps) {
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
      if (onSubmit) {
        await onSubmit(data[fieldName]);
        form.reset(data); // reset to updated data if success
      }
    } catch (error) {
      console.log("Error has been caught and form has been reset");
      form.reset(); // reset to original form data if error
    }
  };

  return (
    <div className="border bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg ">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-0">
        {description && <p className="text-sm mb-4">{description}</p>}
        <Form {...form}>
          <form
            {...(action
              ? { action }
              : { onSubmit: form.handleSubmit(handleFormSubmit) })}
            className="space-y-6"
          >
            {/* Use the renderField prop */}
            {renderField && renderField(form)}

            <div className="mt-6 -mx-6 -mb-6 px-6 py-4 flex rounded-b-xl bg-muted/50 justify-between border-t items-center">
              <span className="text-sm flex gap-2 flex-wrap">
                Learn about
                <a
                  onClick={() =>
                    toast("🧑‍🍳 In the kitchen...", {
                      description:
                        "GIMS documentation is still in active development. Check back later",
                    })
                  }
                  href={undefined}
                  className="text-primary text-sm flex items-center hover:underline sm:ml-1"
                >
                  {title}
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </span>
              {savable && (
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
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </div>
  );
}
