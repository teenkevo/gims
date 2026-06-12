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
import type { ALL_EQUIPMENT_QUERY_RESULT } from "../../../../../sanity.types";
import { removeLabEquipmentBulk } from "@/lib/actions";

export function RemoveLabEquipmentDialog({
  labId,
  equipment,
  open,
  onClose,
}: {
  labId: string;
  equipment: ALL_EQUIPMENT_QUERY_RESULT;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRemove = () => {
    if (equipment.length === 0) return;

    startTransition(async () => {
      const result = await removeLabEquipmentBulk(
        labId,
        equipment.map((item) => item._id)
      );
      if (result.status === "ok") {
        toast.success(
          equipment.length === 1
            ? `${equipment[0].name ?? equipment[0].internalId ?? "Equipment"} removed from laboratory`
            : `${equipment.length} equipment items removed from laboratory`
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
            Remove {equipment.length === 1 ? "equipment" : `${equipment.length} equipment items`}{" "}
            from laboratory?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-sm text-muted-foreground">
              {equipment.length === 1 ? (
                <p>
                  This will unassign{" "}
                  <span className="font-medium text-foreground">
                    {equipment[0].name ?? equipment[0].internalId}
                  </span>{" "}
                  from this laboratory.
                </p>
              ) : (
                <>
                  <p>
                    This will unassign the following equipment from this
                    laboratory.
                  </p>
                  <ul className="list-inside list-disc">
                    {equipment.map((item) => (
                      <li key={item._id} className="text-foreground">
                        {item.name ?? item.internalId}
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
              `Remove${equipment.length > 1 ? ` (${equipment.length})` : ""}`
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
