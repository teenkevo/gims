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
import { DestructiveButtonLoading } from "@/components/button-loading";
import { toast } from "sonner";
import { useActionState } from "react";
import { deleteMultipleTestMethodsFromService } from "@/lib/actions";

export function DeleteMultipleTestMethodsFromService({
  ids,
  serviceId,
  open,
  onClose,
}: {
  ids: string[];
  serviceId: string;
  open: boolean;
  onClose: () => void;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const action = async (_: void | null) => {
    const result = await deleteMultipleTestMethodsFromService(serviceId, ids);
    if (result.status === "ok") {
      toast.success("Test methods have been deleted");
      onClose();
    } else {
      toast.error(`Test methods cannot be deleted.`);
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
          className="sm:max-w-3xl"
        >
          <DialogHeader className="space-y-3">
            <DialogTitle>Dissociate Test Methods From Service</DialogTitle>
            <DialogDescription>
              These test methods will be dissociated from this service.
            </DialogDescription>
            <div className="bg-orange-500/10 text-orange-500 p-3 rounded text-sm">
              <span className="font-bold">Warning</span>: You can reassociate
              the test methods later
            </div>
          </DialogHeader>
          <DialogFooter>
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
              >
                Dissociate
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
          <DialogTitle>Dissociate Test Methods From Service</DialogTitle>
          <DialogDescription>
            These test methods will be dissociated from this service.
          </DialogDescription>
          <div className="bg-orange-500/10 text-orange-500 p-3 rounded text-sm">
            <span className="font-bold">Warning</span>: You can reassociate the
            test methods later
          </div>
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
            >
              Dissociate
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
