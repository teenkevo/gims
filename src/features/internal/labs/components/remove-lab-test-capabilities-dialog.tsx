"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ReloadIcon } from "@radix-ui/react-icons";
import type { ALL_SERVICES_QUERY_RESULT } from "../../../../../sanity.types";
import { removeLabTestCapabilitiesBulk } from "@/lib/actions";

export function RemoveLabTestCapabilitiesDialog({
  labId,
  services,
  open,
  onClose,
}: {
  labId: string;
  services: ALL_SERVICES_QUERY_RESULT;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRemove = () => {
    if (services.length === 0) return;

    startTransition(async () => {
      const result = await removeLabTestCapabilitiesBulk(
        labId,
        services.map((item) => item._id)
      );
      if (result.status === "ok") {
        toast.success(
          services.length === 1
            ? `${services[0].testParameter ?? services[0].code ?? "Test capability"} removed from laboratory`
            : `${services.length} test capabilities removed from laboratory`
        );
        onClose();
        router.refresh();
      } else {
        toast.error(
          typeof result.error === "string" ? result.error : "Something went wrong"
        );
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Remove{" "}
            {services.length === 1
              ? "test capability"
              : `${services.length} test capabilities`}{" "}
            from laboratory?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-sm text-muted-foreground">
              {services.length === 1 ? (
                <p>
                  This will unassign{" "}
                  <span className="font-medium text-foreground">
                    {services[0].testParameter ?? services[0].code}
                  </span>{" "}
                  from this laboratory.
                </p>
              ) : (
                <>
                  <p>
                    This will unassign the following test capabilities from
                    this laboratory.
                  </p>
                  <ul className="list-inside list-disc">
                    {services.map((item) => (
                      <li key={item._id} className="text-foreground">
                        {item.testParameter ?? item.code}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              handleRemove();
            }}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? (
              <>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                Removing...
              </>
            ) : (
              `Remove${services.length > 1 ? ` (${services.length})` : ""}`
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
