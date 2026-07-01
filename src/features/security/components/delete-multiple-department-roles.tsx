"use client";

import { useTransition } from "react";
import { ReloadIcon } from "@radix-ui/react-icons";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { removeDepartmentRoles } from "@/lib/auth/department-actions";
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

export type DepartmentRoleRow = {
  roleName: string;
  permissionSet: string;
  personnelCount: number;
  appRoleId?: string;
  appRoleIds?: string[];
};

interface DeleteMultipleDepartmentRolesProps {
  departmentId: string;
  roles: DepartmentRoleRow[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export function DeleteMultipleDepartmentRoles({
  departmentId,
  roles,
  open,
  onOpenChange,
  onDeleted,
}: DeleteMultipleDepartmentRolesProps) {
  const [isPending, startTransition] = useTransition();

  const blocked = roles.filter((role) => role.personnelCount > 0);
  const deletable = roles.filter((role) => role.personnelCount === 0);

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await removeDepartmentRoles(
          departmentId,
          roles.map((role) => role.roleName)
        );

        if (result.removedCount === 0) {
          toast.error(
            "No roles could be removed. Reassign or remove assigned personnel first."
          );
          return;
        }

        if (result.blocked.length > 0) {
          toast.warning(
            `Removed ${result.removedCount} role${result.removedCount === 1 ? "" : "s"}. ${result.blocked.length} could not be removed because they have assigned personnel.`
          );
        } else {
          toast.success(
            result.removedCount > 1
              ? `${result.removedCount} roles removed`
              : "Role removed"
          );
        }

        onOpenChange(false);
        onDeleted();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to remove roles"
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
          <AlertDialogTitle>Remove roles?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm text-muted-foreground">
              {blocked.length > 0 && (
                <div className="flex items-start gap-2 rounded bg-orange-500/10 p-3 text-orange-600">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    {blocked.length} role
                    {blocked.length > 1 ? "s have" : " has"} assigned personnel
                    and cannot be removed:{" "}
                    <span className="font-medium text-foreground">
                      {blocked.map((role) => role.roleName).join(", ")}
                    </span>
                  </span>
                </div>
              )}

              {deletable.length > 0 ? (
                <>
                  <p>
                    {deletable.length > 1
                      ? "These roles will be removed from the department:"
                      : "This role will be removed from the department:"}
                  </p>
                  <ul className="list-inside list-disc text-foreground">
                    {deletable.map((role) => (
                      <li key={role.roleName}>{role.roleName}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <p>None of the selected roles can be removed.</p>
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
                  Removing...
                </>
              ) : (
                `Remove ${deletable.length} role${deletable.length === 1 ? "" : "s"}`
              )}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
