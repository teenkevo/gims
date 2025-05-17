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
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { DestructiveButtonLoading } from "@/components/button-loading";
import { toast } from "sonner";
import { deleteContactPerson, removeContactFromProject } from "@/lib/actions";
import { startTransition, useActionState } from "react";
import { CLIENT_BY_ID_QUERYResult } from "../../../../../../../sanity.types";

export function DeleteContactDialog({
  contact,
  open,
  onClose,
}: {
  contact: CLIENT_BY_ID_QUERYResult[number]["contacts"][number];
  open: boolean;
  onClose: () => void;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const action = async (_: void | null) => {
    const result = await deleteContactPerson(contact._id);
    if (result.status === "ok") {
      onClose();
      toast.success("Contact has been deleted");
    } else {
      toast.error("Something went wrong");
    }
  };

  const [_, dispatch, isPending] = useActionState(action, null);

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
          aria-describedby={undefined}
          className="sm:max-w-3xl"
        >
          <DialogHeader className="space-y-3">
            <DialogTitle>Delete Contact Person</DialogTitle>
            <DialogDescription>
              This contact will be deleted. All correspondences will be sent to the remaining
              contact persons.
            </DialogDescription>
            <div className="bg-destructive/10 text-destructive p-3 rounded text-sm">
              <span className="font-bold">Warning</span>: This action is not reversible. Please be
              certain.
            </div>
          </DialogHeader>
          <DialogFooter>
            {isPending ? (
              <DestructiveButtonLoading />
            ) : (
              <Button
                onClick={() => startTransition(() => dispatch())}
                variant="destructive"
                type="submit"
                disabled={isPending}
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
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DrawerHeader className="gap-3 text-left">
          <DialogTitle>Delete Contact Person</DialogTitle>
          <DialogDescription>
            This contact will be deleted. All correspondences will be sent to the remaining contact
            persons.
          </DialogDescription>
          <div className="bg-destructive/10 text-destructive p-3 rounded text-sm">
            <span className="font-bold">Warning</span>: This action is not reversible. Please be
            certain
          </div>
        </DrawerHeader>

        <DrawerFooter className="pt-2">
          {isPending ? (
            <DestructiveButtonLoading />
          ) : (
            <Button
              onClick={() => startTransition(() => dispatch())}
              variant="destructive"
              type="submit"
              disabled={isPending}
            >
              Delete
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
