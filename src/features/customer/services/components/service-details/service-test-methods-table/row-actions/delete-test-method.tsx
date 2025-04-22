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
import { deleteTestMethodFromService } from "@/lib/actions";

export function DeleteTestMethodFromService({
  id,
  open,
  onClose,
  serviceId,
}: {
  id: string;
  open: boolean;
  onClose: () => void;
  serviceId: string;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const action = async (_: void | null) => {
    const result = await deleteTestMethodFromService(serviceId, id);
    if (result.status === "ok") {
      toast.success("Test method has been dissociated from service");
      onClose();
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
          className="sm:max-w-3xl"
        >
          <DialogHeader className="space-y-3">
            <DialogTitle>Dissociate Test Method From Service</DialogTitle>
            <DialogDescription>
              This test method will be dissociated from this service.
            </DialogDescription>
            <div className="bg-orange-500/10 text-orange-500 p-3 rounded text-sm">
              <span className="font-bold">Warning</span>: You can reassociate
              the test method later
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
          <DialogTitle>Dissociate Test Method From Service</DialogTitle>
          <DialogDescription>
            This test method will be dissociated from this service.
          </DialogDescription>
          <div className="bg-orange-500/10 text-orange-500 p-3 rounded text-sm">
            <span className="font-bold">Warning</span>: You can reassociate the
            test method later
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
