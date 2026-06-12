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
import type { ALL_PERSONNEL_QUERY_RESULT } from "../../../../../sanity.types";
import { removeLabStaffBulk } from "@/lib/actions";

export function RemoveLabStaffDialog({
  labId,
  people,
  open,
  onClose,
}: {
  labId: string;
  people: ALL_PERSONNEL_QUERY_RESULT;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRemove = () => {
    if (people.length === 0) return;

    startTransition(async () => {
      const result = await removeLabStaffBulk(
        labId,
        people.map((person) => person._id)
      );
      if (result.status === "ok") {
        toast.success(
          people.length === 1
            ? `${people[0].fullName ?? people[0].internalId ?? "Staff member"} removed from laboratory`
            : `${people.length} staff members removed from laboratory`
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
            Remove {people.length === 1 ? "staff member" : `${people.length} staff members`} from
            laboratory?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-sm text-muted-foreground">
              {people.length === 1 ? (
                <p>
                  This will unassign{" "}
                  <span className="font-medium text-foreground">
                    {people[0].fullName ?? people[0].internalId}
                  </span>{" "}
                  from this laboratory. If they are the lab head, that designation
                  will also be cleared.
                </p>
              ) : (
                <>
                  <p>
                    This will unassign the following staff from this laboratory.
                    If the lab head is included, that designation will also be
                    cleared.
                  </p>
                  <ul className="list-inside list-disc">
                    {people.map((person) => (
                      <li key={person._id} className="text-foreground">
                        {person.fullName ?? person.internalId}
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
              `Remove${people.length > 1 ? ` (${people.length})` : ""}`
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
