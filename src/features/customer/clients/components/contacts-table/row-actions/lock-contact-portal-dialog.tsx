"use client";

import { useTransition } from "react";
import { ReloadIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";
import type { CLIENT_BY_ID_QUERY_RESULT } from "../../../../../../../sanity.types";
import { lockContactPortalAccessAction } from "@/lib/actions";
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

export function LockContactPortalDialog({
  contact,
  open,
  onClose,
}: {
  contact: CLIENT_BY_ID_QUERY_RESULT[number]["contacts"][number];
  open: boolean;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleLock = () => {
    startTransition(async () => {
      const result = await lockContactPortalAccessAction(contact._id);
      if (result.status === "ok") {
        toast.success("Portal access locked");
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
          <AlertDialogTitle>Lock portal access?</AlertDialogTitle>
          <AlertDialogDescription>
            This will prevent the user from signing in to your application.
          </AlertDialogDescription>
          <div className="rounded bg-destructive/10 p-3 text-sm text-destructive">
            <span className="font-bold">Warning</span>: This lock is indefinite.
            The contact will remain locked until it is unlocked again.
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              handleLock();
            }}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? (
              <>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                Locking...
              </>
            ) : (
              "Lock"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
