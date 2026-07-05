"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import type { AppRoleRecord } from "@/sanity/lib/auth/getAllAppRoles";
import {
  addDepartmentRole,
  updateDepartmentRole,
} from "@/lib/auth/department-actions";
import { fetchSecurityRoles } from "@/lib/auth/security-tab-actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type DepartmentRoleEditTarget = {
  roleName: string;
  appRoleIds?: string[];
};

interface DepartmentRoleEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentId: string;
  role?: DepartmentRoleEditTarget | null;
  canManage: boolean;
  onSuccess?: () => void;
}

export function DepartmentRoleEditorDialog({
  open,
  onOpenChange,
  departmentId,
  role,
  canManage,
  onSuccess,
}: DepartmentRoleEditorDialogProps) {
  const isEdit = Boolean(role);
  const [roleName, setRoleName] = useState("");
  const [selectedAppRoleIds, setSelectedAppRoleIds] = useState<Set<string>>(
    new Set()
  );
  const [appRoles, setAppRoles] = useState<AppRoleRecord[]>([]);
  const [isPending, startTransition] = useTransition();

  const isValid = roleName.trim().length > 0;

  useEffect(() => {
    if (!open) return;

    fetchSecurityRoles()
      .then(setAppRoles)
      .catch(() => toast.error("Failed to load permission sets"));

    setRoleName(role?.roleName ?? "");
    setSelectedAppRoleIds(new Set(role?.appRoleIds ?? []));
  }, [open, role]);

  const togglePermissionSet = (appRoleId: string, checked: boolean) => {
    setSelectedAppRoleIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(appRoleId);
      } else {
        next.delete(appRoleId);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    if (!roleName.trim()) {
      toast.error("Role name is required");
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          roleName: roleName.trim(),
          appRoleIds: Array.from(selectedAppRoleIds),
        };

        if (isEdit && role) {
          await updateDepartmentRole(departmentId, role.roleName, payload);
          toast.success("Role updated");
        } else {
          await addDepartmentRole(departmentId, payload);
          toast.success("Role created");
        }

        onOpenChange(false);
        onSuccess?.();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : isEdit
              ? "Failed to update role"
              : "Failed to create role"
        );
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit role" : "Create role"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="department-role-name" required>
              Role name
            </Label>
            <Input
              id="department-role-name"
              value={roleName}
              onChange={(event) => setRoleName(event.target.value)}
              placeholder="e.g. Lab Technician"
              disabled={!canManage || isPending}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Permission sets</Label>
            <div className="max-h-48 space-y-3 overflow-y-auto rounded-md border p-3">
              {appRoles.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No permission sets available.
                </p>
              ) : (
                appRoles.map((appRole) => (
                  <div key={appRole._id} className="flex items-center gap-3">
                    <Checkbox
                      id={`department-role-permission-set-${appRole._id}`}
                      checked={selectedAppRoleIds.has(appRole._id)}
                      onCheckedChange={(value) =>
                        togglePermissionSet(appRole._id, value === true)
                      }
                      disabled={!canManage || isPending}
                    />
                    <Label
                      htmlFor={`department-role-permission-set-${appRole._id}`}
                      className="cursor-pointer font-normal"
                    >
                      {appRole.name}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {canManage && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending || !isValid}>
              {isPending ? "Saving..." : isEdit ? "Save changes" : "Create role"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
