"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import type { AppRoleRecord } from "@/sanity/lib/auth/getAllAppRoles";
import { permissionsToMatrixSummary } from "@/lib/auth/permission-resources";
import { RoleEditorDialog } from "./role-editor-dialog";
import { RolesTableRowActions } from "./roles-table-row-actions";
import { DeleteMultipleRoles } from "./delete-multiple-roles";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RolesManagerProps {
  roles: AppRoleRecord[];
  canManage: boolean;
  onRolesChange?: () => void;
}

function formatRoleDate(value?: string) {
  if (!value) return "—";
  return format(new Date(value), "PP");
}

export function RolesManager({
  roles,
  canManage,
  onRolesChange,
}: RolesManagerProps) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<AppRoleRecord | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const selectedRoles = useMemo(
    () => roles.filter((role) => selectedIds.has(role._id)),
    [roles, selectedIds]
  );

  const allSelected = roles.length > 0 && selectedIds.size === roles.length;
  const someSelected =
    selectedIds.size > 0 && selectedIds.size < roles.length;

  const openCreate = () => {
    setEditingRole(null);
    setEditorOpen(true);
  };

  const openEdit = (role: AppRoleRecord) => {
    setEditingRole(role);
    setEditorOpen(true);
  };

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(roles.map((role) => role._id)));
      return;
    }
    setSelectedIds(new Set());
  };

  const toggleOne = (roleId: string, checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(roleId);
      } else {
        next.delete(roleId);
      }
      return next;
    });
  };

  const handleDeleted = () => {
    setSelectedIds(new Set());
    onRolesChange?.();
  };

  return (
    <>
      <div className="border bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>All roles</CardTitle>
          </div>
          {canManage && (
            <div className="flex flex-wrap items-center justify-end gap-2">
              {selectedIds.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete {selectedIds.size} role
                  {selectedIds.size === 1 ? "" : "s"}
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
                  <TableHead>Role name</TableHead>
                  <TableHead>Created by</TableHead>
                  <TableHead>Created on</TableHead>
                  <TableHead>Modified by</TableHead>
                  <TableHead>Permissions</TableHead>
                  {canManage && (
                    <TableHead className="w-[72px] text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={canManage ? 7 : 5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No roles yet. Create one to define a permission profile.
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => (
                    <TableRow
                      key={role._id}
                      className="cursor-pointer hover:bg-muted/50"
                      data-state={
                        selectedIds.has(role._id) ? "selected" : undefined
                      }
                      onClick={() => openEdit(role)}
                    >
                      {canManage && (
                        <TableCell onClick={(event) => event.stopPropagation()}>
                          <Checkbox
                            checked={selectedIds.has(role._id)}
                            onCheckedChange={(value) =>
                              toggleOne(role._id, value === true)
                            }
                            aria-label={`Select ${role.name}`}
                          />
                        </TableCell>
                      )}
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {role.name}
                          {role.archived && (
                            <Badge variant="secondary">Archived</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{role.createdBy ?? "—"}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatRoleDate(role._createdAt)}
                      </TableCell>
                      <TableCell>{role.modifiedBy ?? "—"}</TableCell>
                      <TableCell>
                        {permissionsToMatrixSummary(role.permissions)}
                      </TableCell>
                      {canManage && (
                        <TableCell
                          className="text-right"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <RolesTableRowActions
                            role={role}
                            onEdit={openEdit}
                            onRolesChange={onRolesChange}
                          />
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <RoleEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        role={editingRole}
        canManage={canManage}
        onSuccess={onRolesChange}
      />

      <DeleteMultipleRoles
        roles={selectedRoles}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={handleDeleted}
      />
    </>
  );
}
