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
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { DestructiveButtonLoading } from "@/components/button-loading";
import { toast } from "sonner";
import { useActionState } from "react";
import { deleteProjectById } from "@/lib/actions";
import { toastActionError } from "@/lib/auth/notify-action-error";

export function DeleteProjectDialog({
  projectId,
  internalId,
  open,
  onClose,
}: {
  projectId: string;
  internalId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const [inputValue, setInputValue] = React.useState("");
  const isDesktop = useMediaQuery("(min-width: 768px)");

  React.useEffect(() => {
    if (!open) {
      setInputValue("");
    }
  }, [open]);

  const action = async (_: void | null) => {
    const result = await deleteProjectById(projectId);
    if (result.status === "ok") {
      toast.success("Project has been deleted");
      onClose();
    } else {
      toastActionError(result);
    }
  };

  const [_, dispatch, isPending] = useActionState(action, null);
  const isDeleteDisabled = inputValue !== internalId;

  const content = (
    <>
      <div className="bg-destructive/10 text-destructive p-3 rounded text-sm">
        <span className="font-bold">Warning</span>: This action is not
        reversible. Please be certain
      </div>
      <div className="grid gap-4 py-4">
        <p className="text-sm text-muted-foreground">
          Enter the project internal ID{" "}
          <span className="font-bold text-foreground">{internalId}</span> to
          confirm this action
        </p>
        <Input
          id="internalId"
          placeholder="Type project internal ID here"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </div>
    </>
  );

  if (isDesktop) {
    return (
      <Dialog loading={isPending} open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader className="space-y-3">
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              This project will be deleted along with its quotations (including
              all revisions), invoices, payments, sample receipts, RFIs, lab
              approval workflows, and uploaded files. Lab and personnel
              assignments will be detached first.
            </DialogDescription>
            {content}
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            {isPending ? (
              <DestructiveButtonLoading />
            ) : (
              <Button
                onClick={() => React.startTransition(() => dispatch())}
                variant="destructive"
                type="submit"
                disabled={isDeleteDisabled}
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
    <Drawer loading={isPending} open={open} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader className="gap-3 text-left">
          <DialogTitle>Delete Project</DialogTitle>
          <DialogDescription>
            This project will be deleted along with its quotations (including
            all revisions), invoices, payments, sample receipts, RFIs, lab
            approval workflows, and uploaded files. Lab and personnel
            assignments will be detached first.
          </DialogDescription>
          {content}
        </DrawerHeader>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DrawerClose>
          {isPending ? (
            <DestructiveButtonLoading />
          ) : (
            <Button
              onClick={() => React.startTransition(() => dispatch())}
              variant="destructive"
              type="submit"
              disabled={isDeleteDisabled}
            >
              Delete
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
