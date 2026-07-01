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
import { deleteClient } from "@/lib/actions";
import type { ALL_CLIENTS_QUERY_RESULT } from "../../../../../../../sanity.types";
import { AlertTriangle, File } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function DeleteClientDialog({
  client,
  open,
  onClose,
}: {
  client: ALL_CLIENTS_QUERY_RESULT[number];
  open: boolean;
  onClose: () => void;
}) {
  const [inputValue, setInputValue] = React.useState("");
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const router = useRouter();

  const connectedProjects = client.projects ?? [];

  React.useEffect(() => {
    if (!open) {
      setInputValue("");
    }
  }, [open]);

  const action = async (_: void | null) => {
    const result = await deleteClient(client._id);
    if (result.status === "ok") {
      toast.success("Client has been deleted");
      onClose();
      router.refresh();
    } else {
      toast.error("Something went wrong");
    }
  };

  const [_, dispatch, isPending] = useActionState(action, null);
  const isDeleteDisabled =
    connectedProjects.length > 0 || inputValue !== client.internalId;

  const blockedContent =
    connectedProjects.length > 0 ? (
      <>
        <div className="flex items-center gap-2 bg-orange-500/10 text-orange-500 p-3 rounded text-sm">
          <AlertTriangle className="h-5 w-5 mr-2" />
          The client has {connectedProjects.length} project
          {connectedProjects.length > 1 ? "s" : ""} referencing them and cannot
          be deleted. Delete the projects first.
        </div>
        <div className="mt-1 flex flex-col gap-4 border border-dashed border-orange-500/50 p-3 rounded text-sm">
          {connectedProjects.map((project) => (
            <Link
              className="flex items-center gap-2 hover:underline underline-offset-2"
              href={`/projects/${project._id}`}
              key={project._id}
            >
              <File className="h-4 w-4 mr-2 text-muted-foreground" />
              {project.name}
            </Link>
          ))}
        </div>
      </>
    ) : (
      <>
        <div className="bg-destructive/10 text-destructive p-3 rounded text-sm">
          <span className="font-bold">Warning</span>: This action is not
          reversible. Please be certain
        </div>
        <div className="grid gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            Enter the client internal ID{" "}
            <span className="font-bold text-foreground">
              {client.internalId}
            </span>{" "}
            to confirm this action
          </p>
          <Input
            id="internalId"
            placeholder="Type client internal ID here"
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
            <DialogTitle>Delete Client</DialogTitle>
            {connectedProjects.length === 0 && (
              <DialogDescription>
                This client will be deleted along with all of their contact
                persons, files, invoices and quotations.
              </DialogDescription>
            )}
            {blockedContent}
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            {connectedProjects.length === 0 &&
              (isPending ? (
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
              ))}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer loading={isPending} open={open} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader className="gap-3 text-left">
          <DialogTitle>Delete Client</DialogTitle>
          {connectedProjects.length === 0 && (
            <DialogDescription>
              This client will be deleted along with all of their contact
              persons, files, invoices and quotations.
            </DialogDescription>
          )}
          {blockedContent}
        </DrawerHeader>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DrawerClose>
          {connectedProjects.length === 0 &&
            (isPending ? (
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
            ))}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
