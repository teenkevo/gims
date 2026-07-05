"use client";

import { useTransition } from "react";
import { ReloadIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";
import type { CLIENT_BY_ID_QUERY_RESULT } from "../../../../../../../sanity.types";
import { unlockContactPortalAccessAction } from "@/lib/actions";
import { toastActionError } from "@/lib/auth/notify-action-error";
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

export function UnlockContactPortalDialog({
  contact,
  open,
  onClose,
}: {
  contact: CLIENT_BY_ID_QUERY_RESULT[number]["contacts"][number];
  open: boolean;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleUnlock = () => {
    startTransition(async () => {
      const result = await unlockContactPortalAccessAction(contact._id);
      if (result.status === "ok") {
        toast.success("Portal access unlocked");
        onClose();
      } else {
        toastActionError(result);
      }
    });
  };

  return (
    <AlertDialog
      loading={isPending}
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isPending) {
          onClose();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unlock portal access?</AlertDialogTitle>
          <AlertDialogDescription>
            This will restore the user&apos;s ability to sign in to your
            application.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              handleUnlock();
            }}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                Unlocking...
              </>
            ) : (
              "Unlock"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
