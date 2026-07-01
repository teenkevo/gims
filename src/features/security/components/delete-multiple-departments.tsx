"use client";

import { useTransition } from "react";
import { ReloadIcon } from "@radix-ui/react-icons";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import type { SecurityDepartmentRecord } from "@/sanity/lib/departments/getSecurityDepartments";
import { deleteDepartments } from "@/lib/auth/department-actions";
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

interface DeleteMultipleDepartmentsProps {
  departments: SecurityDepartmentRecord[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export function DeleteMultipleDepartments({
  departments,
  open,
  onOpenChange,
  onDeleted,
}: DeleteMultipleDepartmentsProps) {
  const [isPending, startTransition] = useTransition();

  const blocked = departments.filter(
    (department) => department.personnelCount > 0
  );
  const deletable = departments.filter(
    (department) => department.personnelCount === 0
  );

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteDepartments(departments.map((d) => d._id));

        if (result.deletedCount === 0) {
          toast.error(
            "No departments could be deleted. Remove assigned personnel first."
          );
          return;
        }

        if (result.blocked.length > 0) {
          toast.warning(
            `Deleted ${result.deletedCount} department${result.deletedCount === 1 ? "" : "s"}. ${result.blocked.length} could not be deleted because they have assigned personnel.`
          );
        } else {
          toast.success(
            result.deletedCount > 1
              ? `${result.deletedCount} departments deleted`
              : "Department deleted"
          );
        }

        onOpenChange(false);
        onDeleted();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete departments"
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
          <AlertDialogTitle>Delete departments?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm text-muted-foreground">
              {blocked.length > 0 && (
                <div className="flex items-start gap-2 rounded bg-orange-500/10 p-3 text-orange-600">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    {blocked.length} department
                    {blocked.length > 1 ? "s have" : " has"} assigned personnel
                    and cannot be deleted:{" "}
                    <span className="font-medium text-foreground">
                      {blocked.map((d) => d.department).join(", ")}
                    </span>
                  </span>
                </div>
              )}

              {deletable.length > 0 ? (
                <>
                  <p>
                    {deletable.length > 1
                      ? "These departments will be permanently deleted:"
                      : "This department will be permanently deleted:"}
                  </p>
                  <ul className="list-inside list-disc text-foreground">
                    {deletable.map((department) => (
                      <li key={department._id}>{department.department}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <p>None of the selected departments can be deleted.</p>
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
                `Delete ${deletable.length} department${deletable.length === 1 ? "" : "s"}`
              )}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
