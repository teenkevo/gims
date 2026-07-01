"use client";

import { useTransition } from "react";
import { ReloadIcon } from "@radix-ui/react-icons";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import type { AppRoleRecord } from "@/sanity/lib/auth/getAllAppRoles";
import { deleteAppRoles } from "@/lib/auth/role-actions";
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

interface DeleteMultipleRolesProps {
  roles: AppRoleRecord[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

function isDeletable(role: AppRoleRecord) {
  return !role.isSystem && !role.archived && !role.inUse;
}

export function DeleteMultipleRoles({
  roles,
  open,
  onOpenChange,
  onDeleted,
}: DeleteMultipleRolesProps) {
  const [isPending, startTransition] = useTransition();

  const blocked = roles.filter((role) => !isDeletable(role));
  const deletable = roles.filter(isDeletable);

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteAppRoles(roles.map((role) => role._id));

        if (result.deletedCount === 0) {
          toast.error(
            "No roles could be deleted. System, archived, and in-use roles cannot be deleted."
          );
          return;
        }

        if (result.blocked.length > 0) {
          toast.warning(
            `Deleted ${result.deletedCount} role${result.deletedCount === 1 ? "" : "s"}. ${result.blocked.length} could not be deleted.`
          );
        } else {
          toast.success(
            result.deletedCount > 1
              ? `${result.deletedCount} roles deleted`
              : "Role deleted"
          );
        }

        onOpenChange(false);
        onDeleted();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete roles"
        );
      }
    });
  };

  return (
    <AlertDialog
      loading={isPending}
      open={open}
      onOpenChange={(nextOpen) => !isPending && onOpenChange(nextOpen)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete roles?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm text-muted-foreground">
              {blocked.length > 0 && (
                <div className="flex items-start gap-2 rounded bg-orange-500/10 p-3 text-orange-600">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    {blocked.length} role
                    {blocked.length > 1 ? "s cannot" : " cannot"} be deleted
                    (system, archived, or in use):{" "}
                    <span className="font-medium text-foreground">
                      {blocked.map((role) => role.name).join(", ")}
                    </span>
                  </span>
                </div>
              )}

              {deletable.length > 0 ? (
                <>
                  <p>
                    {deletable.length > 1
                      ? "These roles will be permanently deleted:"
                      : "This role will be permanently deleted:"}
                  </p>
                  <ul className="list-inside list-disc text-foreground">
                    {deletable.map((role) => (
                      <li key={role._id}>{role.name}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <p>None of the selected roles can be deleted.</p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          {deletable.length > 0 && (
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleDelete();
              }}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? (
                <>
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                `Delete ${deletable.length} role${deletable.length === 1 ? "" : "s"}`
              )}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
