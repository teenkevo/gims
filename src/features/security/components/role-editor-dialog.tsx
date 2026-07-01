import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import type { AppRoleRecord } from "@/sanity/lib/auth/getAllAppRoles";
import type { Permission } from "@/lib/auth/permissions";
import { createAppRole, updateAppRole } from "@/lib/auth/role-actions";
import { PermissionMatrix } from "./permission-matrix";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface RoleEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: AppRoleRecord | null;
  canManage: boolean;
  onSuccess?: () => void;
}

export function RoleEditorDialog({
  open,
  onOpenChange,
  role,
  canManage,
  onSuccess,
}: RoleEditorDialogProps) {
  const isEdit = Boolean(role);
  const [name, setName] = useState(role?.name ?? "");
  const [permissions, setPermissions] = useState<Permission[]>(
    role?.permissions ?? []
  );
  const [isPending, startTransition] = useTransition();

  const isValid = name.trim().length > 0 && permissions.length > 0;

  useEffect(() => {
    if (!open) return;
    setName(role?.name ?? "");
    setPermissions(role?.permissions ?? []);
  }, [open, role]);

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Permission set name is required");
      return;
    }

    if (permissions.length === 0) {
      toast.error("Select at least one permission");
      return;
    }

    startTransition(async () => {
      try {
        if (isEdit && role) {
          await updateAppRole({
            id: role._id,
            name,
            permissions,
          });
          toast.success("Permission set updated");
        } else {
          await createAppRole({ name, permissions });
          toast.success("Permission set created");
        }
        onOpenChange(false);
        onSuccess?.();
      } catch {
        toast.error(
          isEdit
            ? "Failed to update permission set"
            : "Failed to create permission set"
        );
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="flex h-[100dvh] max-h-[100dvh] flex-col gap-0 rounded-none border-t p-0"
      >
        <div className="shrink-0 border-b px-6 py-5 pr-14">
          <SheetHeader className="text-left">
            <SheetTitle>
              {isEdit
                ? canManage
                  ? "Edit permission set"
                  : "Permission set details"
                : "Create permission set"}
            </SheetTitle>
            <SheetDescription>
              Assign fine-grained permissions for each module. This permission
              set can later be linked to departmental job titles.
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto w-full max-w-5xl space-y-6">
            <div className="space-y-2">
              <Label htmlFor="role-name" required>
                Permission set name
              </Label>
              <Input
                id="role-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lab Operations"
                disabled={!canManage || isPending}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label required>Permissions</Label>
              <PermissionMatrix
                permissions={permissions}
                onChange={setPermissions}
                disabled={!canManage || isPending}
              />
            </div>
          </div>
        </div>

        {canManage && (
          <SheetFooter className="shrink-0 border-t px-6 py-4 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending || !isValid}>
              {isPending
                ? "Saving..."
                : isEdit
                  ? "Save changes"
                  : "Create permission set"}
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
