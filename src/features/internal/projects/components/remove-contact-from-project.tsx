import * as React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { DestructiveButtonLoading } from "@/components/button-loading";
import { toast } from "sonner";
import { useRemoveContactFromProject } from "@/features/customer/clients/api/use-remove-contact-from-project";
import { revalidateProject } from "@/lib/actions";

export function RemoveContactFromProject({
  email,
  projectId,
  contactId,
}: {
  email: string;
  projectId: string;
  contactId: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(""); // Track input value
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { mutation } = useRemoveContactFromProject();

  const handleRemoveContactFromProject = async () => {
    setIsSubmitting(true);
    const result = await mutation.mutateAsync({
      json: {
        projectId,
        contactId,
      },
    });

    if (result) {
      revalidateProject(projectId).then(() => {
        setOpen(false);
        setIsSubmitting(false);
        toast.success("Contact has been removed from project");
      });
    } else {
      toast.error("Something went wrong");
    }
  };

  const isDeleteDisabled = inputValue !== email; // Disable button if emails don't match

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="icon" variant="outline">
            <TrashIcon className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader className="space-y-3">
            <DialogTitle>Remove Contact Person from Project</DialogTitle>
            <DialogDescription>
              This contact will be removed from the project. All correspondences
              will be sent to the remaining contact persons.
            </DialogDescription>
            <div className="bg-destructive/10 text-destructive p-3 rounded text-sm">
              <span className="font-bold">Warning</span>: This action is not
              reversible. Please be certain.
            </div>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              Enter the contact person's email{" "}
              <span className="font-bold text-foreground">{email}</span> to
              confirm this action
            </p>
            <Input
              id="name"
              placeholder="Type contact email here"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)} // Track input value
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            {isSubmitting ? (
              <DestructiveButtonLoading />
            ) : (
              <Button
                onClick={() => handleRemoveContactFromProject()}
                variant="destructive"
                type="submit"
                disabled={isDeleteDisabled} // Disable button if names don't match
              >
                Remove
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
      </DialogTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-3 text-left">
          <DialogTitle>Remove Contact Person from Project</DialogTitle>
          <DialogDescription>
            This contact will be removed from the project.
          </DialogDescription>
          <div className="bg-destructive/10 text-destructive p-3 rounded text-sm">
            <span className="font-bold">Warning</span>: This action is not
            reversible. Please be certain
          </div>
        </DrawerHeader>
        <div className="grid gap-4 py-4 px-4">
          <p className="text-sm text-muted-foreground">
            Enter the contact email{" "}
            <span className="font-bold text-foreground">{email}</span> to
            confirm this action
          </p>
          <Input
            id="name"
            placeholder="Type contact email here"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)} // Track input value
            className="col-span-3"
          />
        </div>
        <DrawerFooter className="pt-2">
          {isSubmitting ? (
            <DestructiveButtonLoading />
          ) : (
            <Button
              onClick={() => handleRemoveContactFromProject()}
              variant="destructive"
              type="submit"
              disabled={isDeleteDisabled} // Disable button if names don't match
            >
              Remove
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
