import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { AlertTriangle, File } from "lucide-react";
import { toast } from "sonner";

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
import { deleteEquipment } from "@/lib/actions";

type EquipmentDeleteTarget = {
  _id: string;
  internalId: string | null;
  labs?: Array<{ _id: string; name: string | null }> | null;
};

export function DeleteEquipmentDialog({
  item,
  open,
  onClose,
}: {
  item: EquipmentDeleteTarget;
  open: boolean;
  onClose: () => void;
}) {
  const [inputValue, setInputValue] = React.useState("");
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const router = useRouter();
  const connectedLabs = item.labs ?? [];

  React.useEffect(() => {
    if (!open) setInputValue("");
  }, [open]);

  const action = async (_: void | null) => {
    const result = await deleteEquipment(item._id);
    if (result.status === "ok") {
      toast.success("Equipment has been deleted");
      onClose();
      router.push("/equipment");
      router.refresh();
    } else if (
      result.error === "Cannot delete equipment assigned to laboratories"
    ) {
      toast.error("Unassign from laboratories before deleting this equipment");
    } else {
      toast.error(
        typeof result.error === "string" ? result.error : "Something went wrong"
      );
    }
  };

  const [_, dispatch, isPending] = useActionState(action, null);
  const isDeleteDisabled =
    connectedLabs.length > 0 || inputValue !== item.internalId;

  const blockedContent =
    connectedLabs.length > 0 ? (
      <>
        <div className="flex items-center gap-2 bg-orange-500/10 text-orange-500 p-3 rounded text-sm">
          <AlertTriangle className="h-5 w-5 mr-2" />
          This equipment is assigned to {connectedLabs.length} laborator
          {connectedLabs.length > 1 ? "ies" : "y"} and cannot be deleted.
        </div>
        <div className="mt-1 flex flex-col gap-4 border border-dashed border-orange-500/50 p-3 rounded text-sm">
          {connectedLabs.map((lab) => (
            <Link
              key={lab._id}
              className="flex items-center gap-2 hover:underline underline-offset-2"
              href={`/labs/${lab._id}`}
            >
              <File className="h-4 w-4 mr-2 text-muted-foreground" />
              {lab.name}
            </Link>
          ))}
        </div>
      </>
    ) : (
      <>
        <div className="bg-destructive/10 text-destructive p-3 rounded text-sm">
          <span className="font-bold">Warning</span>: This action is not
          reversible. Associated maintenance logs will also be removed.
        </div>
        <div className="grid gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            Enter the equipment ID{" "}
            <span className="font-bold text-foreground">{item.internalId}</span>{" "}
            to confirm
          </p>
          <Input
            placeholder="Type equipment ID here"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
      </>
    );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader className="space-y-3">
            <DialogTitle>Delete Equipment</DialogTitle>
            {connectedLabs.length === 0 && (
              <DialogDescription>
                This equipment record will be permanently removed.
              </DialogDescription>
            )}
            {blockedContent}
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            {connectedLabs.length === 0 &&
              (isPending ? (
                <DestructiveButtonLoading />
              ) : (
                <Button
                  onClick={() => React.startTransition(() => dispatch())}
                  variant="destructive"
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
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader className="gap-3 text-left">
          <DialogTitle>Delete Equipment</DialogTitle>
          {connectedLabs.length === 0 && (
            <DialogDescription>
              This equipment record will be permanently removed.
            </DialogDescription>
          )}
          {blockedContent}
        </DrawerHeader>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DrawerClose>
          {connectedLabs.length === 0 &&
            (isPending ? (
              <DestructiveButtonLoading />
            ) : (
              <Button
                onClick={() => React.startTransition(() => dispatch())}
                variant="destructive"
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
