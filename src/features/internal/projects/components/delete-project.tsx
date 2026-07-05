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
import { useActionState } from "react";
import { deleteProject } from "@/lib/actions";
import { PROJECT_BY_ID_QUERY_RESULT } from "../../../../../sanity.types";
import { toastActionError } from "@/lib/auth/notify-action-error";

export function DeleteProject({
  project,
}: {
  project: PROJECT_BY_ID_QUERY_RESULT[number];
}) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(""); // Track input value
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const router = useRouter();

  // Reset input value when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      setInputValue("");
    }
  }, [open]);

  const action = async (_: void | null) => {
    const result = await deleteProject(project);
    if (result.status === "ok") {
      toast.success("Project has been deleted");
      router.push("/projects");
    } else {
      toastActionError(result);
    }
  };

  const [_, dispatch, isPending] = useActionState(action, null);

  // Use internalId for validation in both desktop and mobile
  const isDeleteDisabled = inputValue !== project.internalId;

  if (isDesktop) {
    return (
      <Dialog loading={isPending} open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive">Delete</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader className="space-y-3">
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              This project will be deleted along with its quotations (including
              all revisions), invoices, payments, sample receipts, RFIs, lab
              approval workflows, and uploaded files. Lab and personnel
              assignments will be detached first.
            </DialogDescription>
            <div className="bg-destructive/10 text-destructive p-3 rounded text-sm">
              <span className="font-bold">Warning</span>: This action is not
              reversible. Please be certain
            </div>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              Enter the project internal ID{" "}
              <span className="font-bold text-foreground">
                {project.internalId}
              </span>{" "}
              to confirm this action
            </p>
            <Input
              id="internalId"
              placeholder="Type project internal ID here"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)} // Track input value
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            {isPending ? (
              <DestructiveButtonLoading />
            ) : (
              <Button
                onClick={() => React.startTransition(() => dispatch())}
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
    <Drawer loading={isPending} open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
      </DialogTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-3 text-left">
          <DialogTitle>Delete Project</DialogTitle>
          <DialogDescription>
            This project will be deleted along with its quotations (including
            all revisions), invoices, payments, sample receipts, RFIs, lab
            approval workflows, and uploaded files. Lab and personnel
            assignments will be detached first.
          </DialogDescription>
          <div className="bg-destructive/10 text-destructive p-3 rounded text-sm">
            <span className="font-bold">Warning</span>: This action is not
            reversible. Please be certain
          </div>
        </DrawerHeader>
        <div className="grid gap-4 py-4 px-4">
          <p className="text-sm text-muted-foreground">
            Enter the project internal ID{" "}
            <span className="font-bold text-foreground">
              {project.internalId}
            </span>{" "}
            to confirm this action
          </p>
          <Input
            id="internalId"
            placeholder="Type project internal ID here"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)} // Track input value
            className="col-span-3"
          />
        </div>
        <DrawerFooter className="pt-2">
          {isPending ? (
            <DestructiveButtonLoading />
          ) : (
            <Button
              onClick={() => React.startTransition(() => dispatch())}
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
