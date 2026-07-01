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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type DepartmentRoleEditTarget = {
  roleName: string;
  appRoleId?: string;
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
  const [appRoleId, setAppRoleId] = useState("");
  const [appRoles, setAppRoles] = useState<AppRoleRecord[]>([]);
  const [isPending, startTransition] = useTransition();

  const isValid = roleName.trim().length > 0;

  useEffect(() => {
    if (!open) return;

    fetchSecurityRoles()
      .then(setAppRoles)
      .catch(() => toast.error("Failed to load permission sets"));

    setRoleName(role?.roleName ?? "");
    setAppRoleId(role?.appRoleId ?? "");
  }, [open, role]);

  const handleSubmit = () => {
    if (!roleName.trim()) {
      toast.error("Role name is required");
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          roleName: roleName.trim(),
          appRoleId: appRoleId || undefined,
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
            <Label>Permission set</Label>
            <Select
              value={appRoleId}
              onValueChange={setAppRoleId}
              disabled={!canManage || isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select permission set" />
              </SelectTrigger>
              <SelectContent>
                {appRoles.map((appRole) => (
                  <SelectItem key={appRole._id} value={appRole._id}>
                    {appRole.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
