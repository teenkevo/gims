import * as React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { updateSampleClass, updateStandard } from "@/lib/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Plus } from "lucide-react";
import {
  ALL_SAMPLE_CLASSES_QUERYResult,
  ALL_STANDARDS_QUERYResult,
} from "../../../../../../../../sanity.types";

interface EditSampleClassType {
  name: string;
  description: string;
  subclasses: { name: string | null; key: string | null }[];
}

export function EditSampleClassDialog({
  open,
  onClose,
  sampleClass,
}: {
  open: boolean;
  onClose: () => void;
  sampleClass: ALL_SAMPLE_CLASSES_QUERYResult[number];
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
          className="sm:max-w-[500px]"
        >
          <DialogHeader>
            <DialogTitle>Edit Sample Class</DialogTitle>
          </DialogHeader>

          <SampleClassForm sampleClass={sampleClass} onClose={onClose} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DrawerHeader className="text-left">
          <DrawerTitle>Edit Sample Class</DrawerTitle>
        </DrawerHeader>

        <SampleClassForm sampleClass={sampleClass} onClose={onClose} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function SampleClassForm({
  onClose,
  sampleClass,
}: {
  onClose: () => void;
  sampleClass: ALL_SAMPLE_CLASSES_QUERYResult[number];
}) {
  // Restored useActionState
  const [state, dispatch, isPending] = React.useActionState(
    updateSampleClass,
    null
  );

  const form = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      name: sampleClass.name || "",
      description: sampleClass.description || "",
      subclasses: sampleClass.subclasses || [],
    },
  });

  // Add useFieldArray after the form declaration
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subclasses",
  });

  const onSubmit = (data: EditSampleClassType) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("sampleClassId", sampleClass._id);
    formData.append("subclasses", JSON.stringify(data.subclasses));
    React.startTransition(() => dispatch(formData)); // Use dispatch instead of createProject
  };

  React.useEffect(() => {
    if (state?.status === "ok") {
      toast.success("Standard has been updated");
      onClose();
    } else if (state?.status === "error") {
      toast.error("Something went wrong");
    }
  }, [state]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`space-y-8 h-[500px] pb-16 px-4 md:px-1 py-4 overflow-y-auto`}
      >
        <FormField
          control={form.control}
          name="name"
          rules={{ required: "Name is required" }}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="flex " required>
                Name
              </FormLabel>
              <FormControl>
                <Input
                  disabled={isPending}
                  placeholder="e.g. Asphalt"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="flex">Description</FormLabel>
              <FormControl>
                <Textarea
                  className="h-[100px]"
                  disabled={isPending}
                  placeholder="Add short description"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Add the subclasses section before the FormSubmitButton in the form */}
        {/* After the description FormField and before the FormSubmitButton, add: */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel>Sample Subclasses</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ name: "", key: "" })}
              disabled={isPending}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Subclass
            </Button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex gap-2 items-start p-3 border rounded-md"
              >
                <div className="flex-grow space-y-2">
                  <FormField
                    control={form.control}
                    name={`subclasses.${index}.name`}
                    rules={{ required: "Name is required" }}
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-xs">Name</FormLabel>
                        <FormControl>
                          <Input
                            disabled={isPending}
                            placeholder="Subclass name"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="w-[15%] min-w-[80px] space-y-2">
                  <FormField
                    control={form.control}
                    name={`subclasses.${index}.key`}
                    rules={{ required: "Required" }}
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-xs">Key</FormLabel>
                        <FormControl>
                          <Input
                            disabled={isPending}
                            placeholder="Key"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 mt-6"
                    onClick={() => remove(index)}
                    disabled={isPending}
                  >
                    <span className="sr-only">Remove</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-red-500"
                    >
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <FormSubmitButton text="Save" isSubmitting={isPending} />
      </form>
    </Form>
  );
}
