import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import React, { useActionState } from "react";
import { updateClientName } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { FormProvider } from "react-hook-form";
import { useForm } from "react-hook-form";
import { ReloadIcon } from "@radix-ui/react-icons";
import { ExternalLink } from "lucide-react";

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
  const action = async (state: void | null, formData: FormData) => {
    const clientName = formData.get("clientName");
    form.reset({ clientName: clientName as string });
    await updateClientName(clientId, projectId, formData);
    toast.success("Client name has been updated");
  };

  const [state, dispatch, isPending] = useActionState(action, null);

  const form = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      clientName: initialValue,
    },
  });

  const formIsEdited = form.formState.isDirty;

  return (
    <FormProvider {...form}>
      <form className="space-y-3" action={dispatch}>
        <div className="flex items-end flex-grow">
          <div className="flex-grow">
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input disabled={isPending} {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {savable && formIsEdited && (
            <div className="flex-grow-0">
              <div className="ml-4">
                <Button type="submit" disabled={isPending || !formIsEdited}>
                  {isPending ? (
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

        <span className="text-sm text-muted-foreground flex">
          Learn more about
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
