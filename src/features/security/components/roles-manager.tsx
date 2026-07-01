"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import type { AppRoleRecord } from "@/sanity/lib/auth/getAllAppRoles";
import { permissionsToMatrixSummary } from "@/lib/auth/permission-resources";
import { RoleEditorDialog } from "./role-editor-dialog";
import { RolesTableRowActions } from "./roles-table-row-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  const [editingRole, setEditingRole] = useState<AppRoleRecord | null>(null);

  const openCreate = () => {
    setEditingRole(null);
    setEditorOpen(true);
  };

  const openEdit = (role: AppRoleRecord) => {
    setEditingRole(role);
    setEditorOpen(true);
  };

  return (
    <>
      <div className="border bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>All roles</CardTitle>
          </div>
          {canManage && (
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create role
            </Button>
          )}
        </CardHeader>

        <div className="px-6 pb-6">
          <div className="rounded-md border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
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
                      colSpan={canManage ? 6 : 5}
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
                      onClick={() => openEdit(role)}
                    >
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
    </>
  );
}
