import { useState, useTransition } from "react";
import { Archive, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { ReloadIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";
import type { AppRoleRecord } from "@/sanity/lib/auth/getAllAppRoles";
import { archiveAppRole, deleteAppRole } from "@/lib/auth/role-actions";
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

interface RolesTableRowActionsProps {
  role: AppRoleRecord;
  onEdit: (role: AppRoleRecord) => void;
  onRolesChange?: () => void;
}

export function RolesTableRowActions({
  role,
  onEdit,
  onRolesChange,
}: RolesTableRowActionsProps) {
  const [confirmAction, setConfirmAction] = useState<
    "delete" | "archive" | null
  >(null);
  const [isPending, startTransition] = useTransition();

  const canDelete = !role.isSystem && !role.archived && !role.inUse;
  const canArchive = !role.isSystem && !role.archived && role.inUse;

  const handleConfirm = () => {
    if (!confirmAction) return;

    startTransition(async () => {
      try {
        if (confirmAction === "delete") {
          await deleteAppRole(role._id);
          toast.success("Role deleted");
        } else {
          await archiveAppRole(role._id);
          toast.success("Role archived");
        }
        setConfirmAction(null);
        onRolesChange?.();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Action failed");
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
          {(canDelete || canArchive) && <DropdownMenuSeparator />}
          {canArchive && (
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setConfirmAction("archive")}
            >
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </DropdownMenuItem>
          )}
          {canDelete && (
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={() => setConfirmAction("delete")}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        loading={isPending && confirmAction === "delete"}
        open={confirmAction === "delete"}
        onOpenChange={(open) => !open && !isPending && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete role?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the role -{" "}
              <strong>{role.name}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleConfirm();
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
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={confirmAction === "archive"}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive role?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{role.name}&quot; is linked to departmental job titles.
              Archiving keeps existing assignments but hides this role from new
              use.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={isPending}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
