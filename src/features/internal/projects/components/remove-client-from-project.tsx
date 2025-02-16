import * as React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { CircleMinus, TrashIcon } from "lucide-react";
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
import { revalidateProject } from "@/lib/actions";
import { useRemoveClientFromProject } from "@/features/customer/clients/api/use-remove-client-from-project";

export function RemoveClientFromProject({
  email,
  projectId,
  clientId,
  clientName,
}: {
  email: string;
  projectId: string;
  clientId: string;
  clientName: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(""); // Track input value
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { mutation } = useRemoveClientFromProject();

  const handleRemoveClientFromProject = async () => {
    setIsSubmitting(true);
    const result = await mutation.mutateAsync({
      json: {
        projectId,
        clientId,
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
          <Button
            variant="ghost"
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <CircleMinus className="mr-2 w-4" />
            Dissociate from projects
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader className="space-y-3">
            <DialogTitle>Dissociate Client From Project</DialogTitle>
            <DialogDescription>
              This action will dissociate{" "}
              <span className="font-bold text-foreground">{clientName}</span>{" "}
              from the project.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            {isSubmitting ? (
              <DestructiveButtonLoading />
            ) : (
              <Button
                onClick={() => handleRemoveClientFromProject()}
                variant="destructive"
                type="submit"
              >
                Confirm
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
          <DialogTitle>Dissociate Client From Project</DialogTitle>
          <DialogDescription>
            This client will be dissociated from the project.
          </DialogDescription>
          <div className="bg-destructive/10 text-destructive p-3 rounded text-sm">
            <span className="font-bold">Warning</span>: This action is not
            reversible. Please be certain
          </div>
        </DrawerHeader>
        <div className="grid gap-4 py-4 px-4">
          <p className="text-sm text-muted-foreground">
            Enter the client's name{" "}
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
              onClick={() => handleRemoveClientFromProject()}
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
