import * as React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
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
import { useRouter } from "next/navigation";
import { DestructiveButtonLoading } from "@/components/button-loading";
import { toast } from "sonner";
import { useState } from "react";
import { useDeleteProject } from "../api/use-delete-project";

export function DeleteProject({ name, id }: { name: string; id: string }) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(""); // Track input value
  const [deleteProjectLoading, setDeleteProjectLoading] = useState(false); // Track loading state
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const router = useRouter();

  const { mutation } = useDeleteProject();

  const handleDeleteProject = async (id: string) => {
    setDeleteProjectLoading(true); // Set loading to true

    mutation.mutate(
      {
        json: {
          projectId: id,
        },
      },
      {
        onSuccess: () => {
          router.push("/projects");
          toast.success("Project has been deleted");
          setDeleteProjectLoading(false);
        },
        onError: () => {
          toast.error("Something went wrong");
          setDeleteProjectLoading(false);
        },
      }
    );

    router.push("/projects");
  };

  const isDeleteDisabled = inputValue !== name; // Disable button if names don't match

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive">Delete</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader className="space-y-3">
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              This project will be deleted, along with all of its Data, Files,
              Invoices and Quotations.
            </DialogDescription>
            <div className="bg-destructive/10 text-destructive p-3 rounded text-sm">
              <span className="font-bold">Warning</span>: This action is not
              reversible. Please be certain
            </div>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              Enter the project name{" "}
              <span className="font-bold text-foreground">{name}</span> to
              confirm this action
            </p>
            <Input
              id="name"
              placeholder="Type project name here"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)} // Track input value
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            {deleteProjectLoading ? (
              <DestructiveButtonLoading />
            ) : (
              <Button
                onClick={() => handleDeleteProject(id)}
                variant="destructive"
                type="submit"
                disabled={isDeleteDisabled} // Disable button if names don't match
              >
                Delete
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
          <DialogTitle>Delete Project</DialogTitle>
          <DialogDescription>
            This project will be deleted, along with all of its Data, Files,
            Invoices and Quotations.
          </DialogDescription>
          <div className="bg-destructive/10 text-destructive p-3 rounded text-sm">
            <span className="font-bold">Warning</span>: This action is not
            reversible. Please be certain
          </div>
        </DrawerHeader>
        <div className="grid gap-4 py-4 px-4">
          <p className="text-sm text-muted-foreground">
            Enter the project name{" "}
            <span className="font-bold text-foreground">{name}</span> to confirm
            this action
          </p>
          <Input
            id="name"
            placeholder="Type project name here"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)} // Track input value
            className="col-span-3"
          />
        </div>
        <DrawerFooter className="pt-2">
          {deleteProjectLoading ? (
            <DestructiveButtonLoading />
          ) : (
            <Button
              onClick={() => handleDeleteProject(id)}
              variant="destructive"
              type="submit"
              disabled={isDeleteDisabled} // Disable button if names don't match
            >
              Delete
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
