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
import { deleteClient, deleteProject } from "@/lib/actions";
import { CLIENT_BY_ID_QUERYResult } from "../../../../../sanity.types";

export function DeleteClient({
  client,
}: {
  client: CLIENT_BY_ID_QUERYResult[number];
}) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(""); // Track input value
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const router = useRouter();

  const action = async (_: void | null) => {
    const result = await deleteClient(client._id);
    if (result.status === "ok") {
      toast.success("Client has been deleted");
      router.push("/clients");
    } else {
      toast.error("Something went wrong");
    }
  };

  const [_, dispatch, isPending] = useActionState(action, null);

  const isDeleteDisabled = inputValue !== client.internalId; // Disable button if names don't match

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive">Delete</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader className="space-y-3">
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              This client will be deleted, along with their contact persons,
              files, invoices and quotations.
            </DialogDescription>
            <div className="bg-destructive/10 text-destructive p-3 rounded text-sm">
              <span className="font-bold">Warning</span>: This action is not
              reversible. Please be certain
            </div>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              Enter the client internal ID{" "}
              <span className="font-bold text-foreground">
                {client.internalId}
              </span>{" "}
              to confirm this action
            </p>
            <Input
              id="name"
              placeholder="Type client internal ID here"
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
    <Drawer open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
      </DialogTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-3 text-left">
          <DialogTitle>Delete Client</DialogTitle>
          <DialogDescription>
            This client will be deleted, along with all of their contact
            persons, files, invoices and quotations.
          </DialogDescription>
          <div className="bg-destructive/10 text-destructive p-3 rounded text-sm">
            <span className="font-bold">Warning</span>: This action is not
            reversible. Please be certain
          </div>
        </DrawerHeader>
        <div className="grid gap-4 py-4 px-4">
          <p className="text-sm text-muted-foreground">
            Enter the client internal ID{" "}
            <span className="font-bold text-foreground">
              {client.internalId}
            </span>{" "}
            to confirm this action
          </p>
          <Input
            id="name"
            placeholder="Type client internal ID here"
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
