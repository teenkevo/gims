import { FormProvider } from "react-hook-form";
import { useForm } from "react-hook-form";
import { ReloadIcon } from "@radix-ui/react-icons";
import { ExternalLink } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import React, { useActionState } from "react";
import { updateClientName } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { toastActionError } from "@/lib/auth/notify-action-error";
import { useRegisterUnsavedChanges } from "@/components/unsaved-changes/unsaved-changes-context";

interface ClientNameFormProps {
  title: string;
  initialValue: string;
  clientId: string;
  projectId: string;
  editable?: boolean;
  unsavedChangesId?: string;
}

export default function ClientNameForm({
  title,
  initialValue,
  clientId,
  projectId,
  editable = true,
  unsavedChangesId,
}: ClientNameFormProps) {
  const action = async (_: void | null, formData: FormData) => {
    const clientName = formData.get("clientName");
    const result = await updateClientName(clientId, formData, projectId);
    if (result.status === "ok") {
      form.reset({ clientName: clientName as string });
      toast.success("Client name has been updated");
    } else {
      toastActionError(result);
    }
  };

  const [_, dispatch, isPending] = useActionState(action, null);

  const form = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      clientName: initialValue,
    },
  });

  const formIsEdited = form.formState.isDirty;
  const resetKey = useRegisterUnsavedChanges(
    unsavedChangesId,
    Boolean(unsavedChangesId) && editable && formIsEdited
  );
  const initialValueRef = React.useRef(initialValue);
  initialValueRef.current = initialValue;

  React.useEffect(() => {
    if (!unsavedChangesId) return;
    form.reset({ clientName: initialValueRef.current });
  }, [resetKey, unsavedChangesId, form]);

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
                  <FormLabel>Client Name</FormLabel>
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
          </div>
          {editable && (formIsEdited || isPending) && (
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
      </form>
    </FormProvider>
  );
}
