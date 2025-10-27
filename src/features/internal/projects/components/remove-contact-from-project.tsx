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
import { removeContactFromProject } from "@/lib/actions";
import { startTransition, useActionState } from "react";

export function RemoveContactFromProject({
  email,
  projectId,
  contactId,
  open,
  onClose,
}: {
  email: string;
  projectId: string;
  contactId: string;
  open?: boolean;
  onClose?: () => void;
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(""); // Track input value
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const isControlled = open !== undefined && onClose !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen);
      if (!newOpen) {
        setInputValue("");
      }
    } else {
      if (!newOpen) {
        onClose?.();
        setInputValue("");
      }
    }
  };

  const action = async (_: void | null) => {
    const result = await removeContactFromProject(contactId, projectId);
    if (result.status === "ok") {
      if (!isControlled) {
        setInternalOpen(false);
      } else {
        onClose?.();
      }
      setInputValue("");
      toast.success("Contact has been updated");
    } else {
      toast.error("Something went wrong");
    }
  };

  const [_, dispatch, isPending] = useActionState(action, null);

  const isDeleteDisabled = inputValue !== email; // Disable button if emails don't match

  if (isDesktop) {
    if (isControlled) {
      return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogContent aria-describedby={undefined} className="sm:max-w-3xl">
            <DialogHeader className="space-y-3">
              <DialogTitle>Remove Contact Person from Project</DialogTitle>
              <DialogDescription>
                This contact will be removed from the project. All
                correspondences will be sent to the remaining contact persons.
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
              {isPending ? (
                <DestructiveButtonLoading />
              ) : (
                <Button
                  onClick={() => startTransition(() => dispatch())}
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
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button size="icon" variant="outline">
            <TrashIcon className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent aria-describedby={undefined} className="sm:max-w-3xl">
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
            {isPending ? (
              <DestructiveButtonLoading />
            ) : (
              <Button
                onClick={() => startTransition(() => dispatch())}
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

  if (isControlled) {
    return (
      <Drawer open={isOpen} onOpenChange={handleOpenChange}>
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
            {isPending ? (
              <DestructiveButtonLoading />
            ) : (
              <Button
                onClick={() => startTransition(() => dispatch())}
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

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline">
          <TrashIcon className="h-4 w-4" />
        </Button>
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
          {isPending ? (
            <DestructiveButtonLoading />
          ) : (
            <Button
              onClick={() => startTransition(() => dispatch())}
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
