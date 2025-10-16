"use client";

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
import { useRouter, useSearchParams } from "next/navigation";
import { ButtonLoading } from "@/components/button-loading";
import { toast } from "sonner";
import { useActionState } from "react";
import { sendQuotation } from "@/lib/actions";
import { Send } from "lucide-react";
import type { PROJECT_BY_ID_QUERYResult } from "../../../../../sanity.types";

export function SendQuotationDialog({
  project,
}: {
  project: PROJECT_BY_ID_QUERYResult[number];
}) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const router = useRouter();
  const searchParams = useSearchParams();

  const { quotation, contactPersons } = project;

  const hasContactPersons = (contactPersons?.length ?? 0) > 0;

  const action = async (_: void | null) => {
    if (!quotation) {
      toast.error("Quotation not found");
      return;
    }
    // GUARD TO CHECK IF PROJECT HAS A CONTACT PERSON BEFORE ACTION EXECUTES
    if (project.contactPersons?.length === 0) {
      toast.warning("This requires a contact person", {
        action: {
          label: "Add Contact",
          onClick: () => {
            window.location.href = `/projects/${project._id}?project=${project.name}&tab=client`;
          },
        },
      });
    }
    const result = await sendQuotation(quotation._id);
    if (result.status === "ok") {
      toast.success("Quotation has been sent");
      setOpen(false);
    } else {
      toast.error("Something went wrong");
    }
  };

  const [_, dispatch, isPending] = useActionState(action, null);

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !hasContactPersons) {
      toast.warning("This requires a contact person", {
        action: {
          label: "Add Contact",
          onClick: () => {
            window.location.href = `/projects/${project._id}?project=${project.name}&tab=client`;
          },
        },
      });
      return;
    }
    setOpen(newOpen);
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button disabled={quotation?.status !== "draft"} size="sm">
            Send to client
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader className="space-y-3">
            <DialogTitle>Send Quotation</DialogTitle>
            <DialogDescription>
              This quotation will be sent to the client.
            </DialogDescription>
            <div className="bg-orange-500/10 text-orange-500 p-3 rounded text-sm">
              <span className="font-bold">Warning</span>: This action will
              finalize the quotation and send it to the client.
            </div>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            {isPending ? (
              <ButtonLoading />
            ) : (
              <Button
                onClick={() => React.startTransition(() => dispatch())}
                type="submit"
              >
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={quotation?.status !== "draft"} size="sm">
          Send Quotation
        </Button>
      </DialogTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-3 text-left">
          <DialogTitle>Send Quotation</DialogTitle>
          <DialogDescription>
            This quotation will be sent to the client.
          </DialogDescription>
          <div className="bg-orange-500/10 text-orange-500 p-3 rounded text-sm">
            <span className="font-bold">Warning</span>: This action will
            finalize the quotation and send it to the client.
          </div>
        </DrawerHeader>

        <DrawerFooter className="pt-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          {isPending ? (
            <ButtonLoading />
          ) : (
            <Button
              onClick={() => React.startTransition(() => dispatch())}
              type="submit"
            >
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
