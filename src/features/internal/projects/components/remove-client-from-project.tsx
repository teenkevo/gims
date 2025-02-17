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
import { removeClientFromProject, revalidateProject } from "@/lib/actions";
import { useRemoveClientFromProject } from "@/features/customer/clients/api/use-remove-client-from-project";
import { useActionState } from "react";

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
  const [inputValue, setInputValue] = React.useState("");
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { mutation } = useRemoveClientFromProject();

  const action = async (_: void | null) => {
    const result = await removeClientFromProject(clientId, projectId);
    if (result.status === "ok") {
      setOpen(false);
      toast.success("Client has been dissociated from project");
    } else {
      toast.error("Something went wrong");
    }
  };

  const [_, dispatch, isPending] = useActionState(action, null);

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
            Dissociate from project
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
            {isPending ? (
              <DestructiveButtonLoading />
            ) : (
              <Button
                onClick={() => React.startTransition(() => dispatch())}
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
        <Button
          variant="ghost"
          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <CircleMinus className="mr-2 w-4" />
          Dissociate from project
        </Button>
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
          {isPending ? (
            <DestructiveButtonLoading />
          ) : (
            <Button
              onClick={() => React.startTransition(() => dispatch())}
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
