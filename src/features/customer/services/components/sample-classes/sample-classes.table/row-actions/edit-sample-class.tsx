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

import { useForm } from "react-hook-form";
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
import { updateStandard } from "@/lib/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";
import { ALL_STANDARDS_QUERYResult } from "../../../../../../../../sanity.types";

interface EditStandardType {
  name: string;
  acronym: string;
  description: string;
}

export function EditStandardDialog({
  open,
  onClose,
  standard,
}: {
  open: boolean;
  onClose: () => void;
  standard: ALL_STANDARDS_QUERYResult[number];
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
          className="sm:max-w-[425px]"
        >
          <DialogHeader>
            <DialogTitle>Edit Standard</DialogTitle>
          </DialogHeader>

          <StandardForm standard={standard} onClose={onClose} />
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
          <DrawerTitle>Edit Standard</DrawerTitle>
        </DrawerHeader>

        <StandardForm standard={standard} onClose={onClose} />
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
  onClose,
  standard,
}: {
  onClose: () => void;
  standard: ALL_STANDARDS_QUERYResult[number];
}) {
  // Restored useActionState
  const [state, dispatch, isPending] = React.useActionState(
    updateStandard,
    null
  );

  const form = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      name: standard.name || "",
      acronym: standard.acronym || "",
      description: standard.description || "",
    },
  });

  const onSubmit = (data: EditStandardType) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("acronym", data.acronym);
    formData.append("description", data.description);
    formData.append("standardId", standard._id);
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
        className={`space-y-8 h-[400px] px-4 md:px-0 py-4`}
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
                  placeholder="e.g. British Standard"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="acronym"
          rules={{ required: "Acronym is required" }}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="flex " required>
                Acronym
              </FormLabel>
              <FormControl>
                <Input disabled={isPending} placeholder="e.g. BS" {...field} />
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
        <FormSubmitButton text="Save" isSubmitting={isPending} />
      </form>
    </Form>
  );
}
