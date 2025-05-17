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
import { activateDeactivateService } from "@/lib/actions";
import { ALL_SERVICES_QUERYResult } from "../../../../../../../sanity.types";

export function ActivateDeactivateService({
  open,
  onClose,
  service,
}: {
  open: boolean;
  onClose: () => void;
  service: ALL_SERVICES_QUERYResult[number];
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [state, dispatch, isPending] = useActionState(activateDeactivateService, null);

  const onActivateDeactivateService = () => {
    const formData = new FormData();
    formData.append("serviceId", service?._id);
    formData.append("status", service?.status === "active" ? "inactive" : "active");
    React.startTransition(() => dispatch(formData));
  };

  React.useEffect(() => {
    if (state?.status === "ok") {
      toast.success(
        `Service has been ${service?.status === "active" ? "activated" : "deactivated"}`
      );
      onClose();
    } else if (state?.status === "error") {
      toast.error("Something went wrong");
    }
  }, [state]);

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
            <DialogTitle>
              {service?.status === "active" ? "Deactivate" : "Activate"} Service
            </DialogTitle>
            <DialogDescription>
              The service{" "}
              <span className="font-bold text-foreground">
                {service?.code} - {service.testParameter}
              </span>{" "}
              will be {service?.status === "active" ? "deactivated" : "activated"}
            </DialogDescription>
            <div className="bg-orange-500/10 text-orange-500 p-3 rounded text-sm">
              <span className="font-bold">Warning</span>: You can activate this service later and it
              will be available for use in future invoices and quotations
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
                onClick={() => onActivateDeactivateService()}
                variant="destructive"
                type="submit"
              >
                {service?.status === "active" ? "Deactivate" : "Activate"}
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
          <DialogTitle>
            {service?.status === "active" ? "Deactivate" : "Activate"} Service
          </DialogTitle>
          <DialogDescription>
            The service will be {service?.status === "active" ? "deactivated" : "activated"}
          </DialogDescription>
          <div className="bg-orange-500/10 text-orange-500 p-3 rounded text-sm">
            <span className="font-bold">Warning</span>: You can activate this service later and it
            will be available for use in future invoices and quotations
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
              onClick={() => onActivateDeactivateService()}
              variant="destructive"
              type="submit"
            >
              {service?.status === "active" ? "Deactivate" : "Activate"}
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
