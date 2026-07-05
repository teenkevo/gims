"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { SecurityDepartmentRecord } from "@/sanity/lib/departments/getSecurityDepartments";
import type { DepartmentDetail } from "@/sanity/lib/departments/getDepartmentDetail";
import { fetchDepartmentDetail } from "@/lib/auth/security-tab-actions";
import { getPermissionSetsForDepartmentRole } from "@/lib/auth/department-role-permission-sets";
import {
  DeleteMultipleDepartmentRoles,
  type DepartmentRoleRow,
} from "./delete-multiple-department-roles";
import {
  DepartmentRoleEditorDialog,
  type DepartmentRoleEditTarget,
} from "./department-role-editor-dialog";
import { DepartmentRolesTableRowActions } from "./department-roles-table-row-actions";
import { SecurityTabLoading } from "./security-tab-loading";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DepartmentRolesViewProps {
  department: SecurityDepartmentRecord;
  onBack: () => void;
  onSelectRole: (roleName: string) => void;
  canManage: boolean;
  onRolesChange?: () => void;
}

export function DepartmentRolesView({
  department,
  onBack,
  onSelectRole,
  canManage,
  onRolesChange,
}: DepartmentRolesViewProps) {
  const [detail, setDetail] = useState<DepartmentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingRole, setEditingRole] =
    useState<DepartmentRoleEditTarget | null>(null);
  const [selectedRoleNames, setSelectedRoleNames] = useState<Set<string>>(
    new Set()
  );

  const loadDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchDepartmentDetail(department._id);
      setDetail(data);
    } catch {
      toast.error("Failed to load department");
      setDetail(null);
    } finally {
      setIsLoading(false);
    }
  }, [department._id]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const roleRows = useMemo((): DepartmentRoleRow[] => {
    if (!detail) return [];

    return detail.roles
      .filter((entry) => entry.roleName)
      .map((entry) => {
        const roleName = entry.roleName as string;
        const personnelCount = detail.personnel.filter(
          (person) => person.role === roleName
        ).length;
        const permissionSets = getPermissionSetsForDepartmentRole(entry);

        return {
          roleName,
          permissionSet:
            permissionSets.map((set) => set.name).join(", ") || "—",
          personnelCount,
          appRoleId: permissionSets[0]?._id,
          appRoleIds: permissionSets.map((set) => set._id),
        };
      });
  }, [detail]);

  const selectedRoles = useMemo(
    () => roleRows.filter((row) => selectedRoleNames.has(row.roleName)),
    [roleRows, selectedRoleNames]
  );

  const allSelected =
    roleRows.length > 0 && selectedRoleNames.size === roleRows.length;
  const someSelected =
    selectedRoleNames.size > 0 && selectedRoleNames.size < roleRows.length;

  const openCreate = () => {
    setEditingRole(null);
    setEditorOpen(true);
  };

  const openEdit = (role: DepartmentRoleRow) => {
    setEditingRole({
      roleName: role.roleName,
      appRoleIds: role.appRoleIds ?? (role.appRoleId ? [role.appRoleId] : []),
    });
    setEditorOpen(true);
  };

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedRoleNames(new Set(roleRows.map((row) => row.roleName)));
      return;
    }
    setSelectedRoleNames(new Set());
  };

  const toggleOne = (roleName: string, checked: boolean) => {
    setSelectedRoleNames((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(roleName);
      } else {
        next.delete(roleName);
      }
      return next;
    });
  };

  const handleRolesChange = () => {
    setSelectedRoleNames(new Set());
    loadDetail();
    onRolesChange?.();
  };

  return (
    <>
      <div className="border bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg">
        <div className="px-6 pt-5 pb-5">
          <Button
            variant="outline"
            size="sm"
            className="-ml-2 h-8 px-2 text-muted-foreground"
            onClick={onBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            All departments
          </Button>
        </div>

        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pt-2">
          <div className="space-y-3">
            <CardTitle>{department.department}</CardTitle>
            <CardDescription>
              Roles available in this department. Select a role to view assigned
              personnel.
            </CardDescription>
          </div>
          {canManage && !isLoading && (
            <div className="flex flex-wrap items-center justify-end gap-2">
              {selectedRoleNames.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete {selectedRoleNames.size} role
                  {selectedRoleNames.size === 1 ? "" : "s"}
                </Button>
              )}
              <Button size="sm" onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Create role
              </Button>
            </div>
          )}
        </CardHeader>

        <div className="px-6 pb-6">
          {isLoading || !detail ? (
            <SecurityTabLoading />
          ) : (
            <div className="rounded-md border bg-background">
              <Table>
                <TableHeader>
                  <TableRow>
                    {canManage && (
                      <TableHead className="w-[48px]">
                        <Checkbox
                          checked={
                            allSelected
                              ? true
                              : someSelected
                                ? "indeterminate"
                                : false
                          }
                          onCheckedChange={(value) => toggleAll(value === true)}
                          aria-label="Select all roles"
                        />
                      </TableHead>
                    )}
                    <TableHead>Role</TableHead>
                    <TableHead>Permission set</TableHead>
                    <TableHead>Personnel</TableHead>
                    {canManage && (
                      <TableHead className="w-[72px] text-right">
                        Actions
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roleRows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={canManage ? 5 : 3}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No roles defined for this department yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    roleRows.map((row) => (
                      <TableRow
                        key={row.roleName}
                        className="cursor-pointer hover:bg-muted/50"
                        data-state={
                          selectedRoleNames.has(row.roleName)
                            ? "selected"
                            : undefined
                        }
                        onClick={() => onSelectRole(row.roleName)}
                      >
                        {canManage && (
                          <TableCell
                            onClick={(event) => event.stopPropagation()}
                          >
                            <Checkbox
                              checked={selectedRoleNames.has(row.roleName)}
                              onCheckedChange={(value) =>
                                toggleOne(row.roleName, value === true)
                              }
                              aria-label={`Select ${row.roleName}`}
                            />
                          </TableCell>
                        )}
                        <TableCell className="font-medium">
                          {row.roleName}
                        </TableCell>
                        <TableCell>{row.permissionSet}</TableCell>
                        <TableCell>{row.personnelCount}</TableCell>
                        {canManage && (
                          <TableCell
                            className="text-right"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <DepartmentRolesTableRowActions
                              departmentId={department._id}
                              role={row}
                              onEdit={openEdit}
                              onRolesChange={handleRolesChange}
                            />
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      <DeleteMultipleDepartmentRoles
        departmentId={department._id}
        roles={selectedRoles}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={handleRolesChange}
      />

      <DepartmentRoleEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        departmentId={department._id}
        role={editingRole}
        canManage={canManage}
        onSuccess={handleRolesChange}
      />
    </>
  );
}
