"use client";

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
import { addSampleClass } from "@/lib/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface SampleClassType {
  name: string;
  description: string;
  subclasses: { name: string; key: string }[];
}

export function CreateSampleClassDialog({
  trigger,
}: {
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger ? (
            trigger
          ) : (
            <Button variant="outline" className="text-sm flex items-center">
              <Plus className="h-4 w-4 mr-2 text-primary" />
              Add new
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Sample Class</DialogTitle>
          </DialogHeader>

          <StandardForm setOpen={setOpen} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button variant="outline" className="text-sm flex items-center">
            <Plus className="h-4 w-4 mr-2 text-primary" />
            Add new
          </Button>
        )}
      </DialogTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Create Sample Class</DrawerTitle>
        </DrawerHeader>

        <StandardForm setOpen={setOpen} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function StandardForm({
  setOpen,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const router = useRouter();

  // Restored useActionState
  const [state, dispatch, isPending] = React.useActionState(
    addSampleClass,
    null
  );

  // In the StandardForm function, update the useForm hook to include subclasses
  const form = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      subclasses: [{ name: "", key: "" }],
    },
  });

  // Add useFieldArray after the form declaration
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subclasses",
  });

  // Update the onSubmit function to include subclasses
  const onSubmit = (data: SampleClassType) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("subclasses", JSON.stringify(data.subclasses));
    React.startTransition(() => dispatch(formData));
  };

  React.useEffect(() => {
    if (state?.status === "ok") {
      toast.success("Sample class has been added");
      setOpen(false);
      router.push("/services/sample-classes");
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
