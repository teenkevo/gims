"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { AppRoleRecord } from "@/sanity/lib/auth/getAllAppRoles";
import {
  createDepartment,
  updateDepartment,
  type DepartmentRoleInput,
} from "@/lib/auth/department-actions";
import {
  fetchDepartmentEditorData,
  fetchSecurityRoles,
} from "@/lib/auth/security-tab-actions";
import { SecurityTabLoading } from "./security-tab-loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type RoleRow = {
  key: string;
  roleName: string;
  appRoleId: string;
};

interface DepartmentEditorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentId?: string | null;
  canManage: boolean;
  onSuccess?: () => void;
}

function createEmptyRoleRow(): RoleRow {
  return {
    key: crypto.randomUUID(),
    roleName: "",
    appRoleId: "",
  };
}

export function DepartmentEditorSheet({
  open,
  onOpenChange,
  departmentId,
  canManage,
  onSuccess,
}: DepartmentEditorSheetProps) {
  const isEdit = Boolean(departmentId);
  const [name, setName] = useState("");
  const [roleRows, setRoleRows] = useState<RoleRow[]>([createEmptyRoleRow()]);
  const [appRoles, setAppRoles] = useState<AppRoleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isValid =
    name.trim().length > 0 &&
    roleRows.some((row) => row.roleName.trim().length > 0);

  useEffect(() => {
    if (!open) return;

    fetchSecurityRoles()
      .then(setAppRoles)
      .catch(() => toast.error("Failed to load application roles"));

    if (!departmentId) {
      setName("");
      setRoleRows([createEmptyRoleRow()]);
      return;
    }

    setIsLoading(true);
    fetchDepartmentEditorData(departmentId)
      .then((data) => {
        if (!data) {
          toast.error("Department not found");
          return;
        }

        setName(data.department ?? "");
        setRoleRows(
          data.roles?.length
            ? data.roles.map((role) => ({
                key: crypto.randomUUID(),
                roleName: role.roleName ?? "",
                appRoleId: role.appRole?._id ?? "",
              }))
            : [createEmptyRoleRow()]
        );
      })
      .catch(() => toast.error("Failed to load department"))
      .finally(() => setIsLoading(false));
  }, [open, departmentId]);

  const updateRoleRow = (
    key: string,
    patch: Partial<Pick<RoleRow, "roleName" | "appRoleId">>
  ) => {
    setRoleRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row))
    );
  };

  const removeRoleRow = (key: string) => {
    setRoleRows((current) => {
      const next = current.filter((row) => row.key !== key);
      return next.length > 0 ? next : [createEmptyRoleRow()];
    });
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Department name is required");
      return;
    }

    const roles: DepartmentRoleInput[] = roleRows
      .map((row) => ({
        roleName: row.roleName.trim(),
        appRoleId: row.appRoleId || undefined,
      }))
      .filter((row) => row.roleName.length > 0);

    if (roles.length === 0) {
      toast.error("Add at least one role");
      return;
    }

    startTransition(async () => {
      try {
        if (isEdit && departmentId) {
          await updateDepartment({ id: departmentId, name, roles });
          toast.success("Department updated");
        } else {
          await createDepartment({ name, roles });
          toast.success("Department created");
        }
        onOpenChange(false);
        onSuccess?.();
      } catch {
        toast.error(
          isEdit ? "Failed to update department" : "Failed to create department"
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
                  ? "Edit department"
                  : "Department details"
                : "Create department"}
            </SheetTitle>
            <SheetDescription>
              Define the department name and the job titles linked to application
              roles.
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isLoading ? (
            <SecurityTabLoading />
          ) : (
            <div className="mx-auto w-full max-w-3xl space-y-6">
              <div className="space-y-2">
                <Label htmlFor="department-name" required>
                  Department name
                </Label>
                <Input
                  id="department-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Laboratory"
                  disabled={!canManage || isPending}
                  autoFocus
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <Label required>Roles</Label>
                  {canManage && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setRoleRows((current) => [
                          ...current,
                          createEmptyRoleRow(),
                        ])
                      }
                      disabled={isPending}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add role
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  {roleRows.map((row, index) => (
                    <div
                      key={row.key}
                      className="grid gap-3 rounded-md border p-4 sm:grid-cols-[1fr_1fr_auto]"
                    >
                      <div className="space-y-2">
                        <Label htmlFor={`role-name-${row.key}`}>Role name</Label>
                        <Input
                          id={`role-name-${row.key}`}
                          value={row.roleName}
                          onChange={(event) =>
                            updateRoleRow(row.key, {
                              roleName: event.target.value,
                            })
                          }
                          placeholder={`e.g. ${index === 0 ? "Lab Technician" : "Role name"}`}
                          disabled={!canManage || isPending}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Application role</Label>
                        <Select
                          value={row.appRoleId}
                          onValueChange={(value) =>
                            updateRoleRow(row.key, { appRoleId: value })
                          }
                          disabled={!canManage || isPending}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select application role" />
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

                      {canManage && (
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => removeRoleRow(row.key)}
                            disabled={isPending || roleRows.length === 1}
                            aria-label="Remove role"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {canManage && !isLoading && (
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
                  : "Create department"}
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
