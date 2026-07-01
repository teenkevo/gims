"use client";

import { useState, useTransition } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { ReloadIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";
import { removeDepartmentRoles } from "@/lib/auth/department-actions";
import type { DepartmentRoleRow } from "./delete-multiple-department-roles";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface DepartmentRolesTableRowActionsProps {
  departmentId: string;
  role: DepartmentRoleRow;
  onEdit: (role: DepartmentRoleRow) => void;
  onRolesChange?: () => void;
}

export function DepartmentRolesTableRowActions({
  departmentId,
  role,
  onEdit,
  onRolesChange,
}: DepartmentRolesTableRowActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const canDelete = role.personnelCount === 0;

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await removeDepartmentRoles(departmentId, [
          role.roleName,
        ]);

        if (result.removedCount === 0) {
          toast.error(
            "Role cannot be removed while personnel are assigned to it"
          );
          return;
        }

        toast.success("Role removed");
        setDeleteOpen(false);
        onRolesChange?.();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to remove role"
        );
      }
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 data-[state=open]:bg-muted"
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => onEdit(role)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:text-destructive"
            onClick={() => setDeleteOpen(true)}
            disabled={!canDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        loading={isPending}
        open={deleteOpen}
        onOpenChange={(open) => !isPending && setDeleteOpen(open)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove role?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <strong>{role.roleName}</strong> from the
              department. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleDelete();
              }}
              disabled={isPending || !canDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? (
                <>
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
