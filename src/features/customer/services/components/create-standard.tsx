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
import { addStandard } from "@/lib/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

interface StandardType {
  name: string;
  acronym: string;
  description: string;
}

export function CreateStandardDialog({
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Standard</DialogTitle>
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
          <DrawerTitle>Create Standard</DrawerTitle>
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
  // Restored useActionState
  const [state, dispatch, isPending] = React.useActionState(addStandard, null);

  const form = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      acronym: "",
      description: "",
    },
  });

  const onSubmit = (data: StandardType) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("acronym", data.acronym);
    formData.append("description", data.description);
    React.startTransition(() => dispatch(formData)); // Use dispatch instead of createProject
  };

  React.useEffect(() => {
    if (state?.status === "ok") {
      toast.success("Standard has been added");
      setOpen(false);
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
