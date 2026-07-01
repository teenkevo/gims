"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import type { SecurityDepartmentRecord } from "@/sanity/lib/departments/getSecurityDepartments";
import { DepartmentRolesView } from "./department-roles-view";
import { DepartmentRolePersonnelView } from "./department-role-personnel-view";
import { DepartmentEditorSheet } from "./department-editor-sheet";
import { DeleteMultipleDepartments } from "./delete-multiple-departments";
import { DepartmentsTableRowActions } from "./departments-table-row-actions";
import { Button } from "@/components/ui/button";
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

interface DepartmentsManagerProps {
  departments: SecurityDepartmentRecord[];
  canManage: boolean;
  onDepartmentsChange?: () => void;
}

function formatDepartmentDate(value?: string) {
  if (!value) return "—";
  return format(new Date(value), "PP");
}

export function DepartmentsManager({
  departments,
  canManage,
  onDepartmentsChange,
}: DepartmentsManagerProps) {
  const [viewingDepartment, setViewingDepartment] =
    useState<SecurityDepartmentRecord | null>(null);
  const [viewingRole, setViewingRole] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(
    null
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const selectedDepartments = useMemo(
    () => departments.filter((department) => selectedIds.has(department._id)),
    [departments, selectedIds]
  );

  const allSelected =
    departments.length > 0 && selectedIds.size === departments.length;
  const someSelected =
    selectedIds.size > 0 && selectedIds.size < departments.length;

  const openDetail = (department: SecurityDepartmentRecord) => {
    setViewingDepartment(department);
    setViewingRole(null);
  };

  const openCreate = () => {
    setEditingDepartmentId(null);
    setEditorOpen(true);
  };

  const openEdit = (department: SecurityDepartmentRecord) => {
    setEditingDepartmentId(department._id);
    setEditorOpen(true);
  };

  const handleDepartmentsChange = () => {
    onDepartmentsChange?.();
  };

  useEffect(() => {
    if (
      viewingDepartment &&
      !departments.some((department) => department._id === viewingDepartment._id)
    ) {
      setViewingDepartment(null);
      setViewingRole(null);
    }
  }, [departments, viewingDepartment]);

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(departments.map((department) => department._id)));
      return;
    }
    setSelectedIds(new Set());
  };

  const toggleOne = (departmentId: string, checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(departmentId);
      } else {
        next.delete(departmentId);
      }
      return next;
    });
  };

  const handleDeleted = () => {
    setSelectedIds(new Set());
    handleDepartmentsChange();
  };

  if (viewingDepartment) {
    const currentDepartment =
      departments.find(
        (department) => department._id === viewingDepartment._id
      ) ?? viewingDepartment;

    if (viewingRole) {
      return (
        <>
          <DepartmentRolePersonnelView
            department={currentDepartment}
            selectedRole={viewingRole}
            onBack={() => setViewingRole(null)}
            canManage={canManage}
            onPersonnelChange={handleDepartmentsChange}
          />

          <DepartmentEditorSheet
            open={editorOpen}
            onOpenChange={setEditorOpen}
            departmentId={editingDepartmentId}
            canManage={canManage}
            onSuccess={handleDepartmentsChange}
          />
        </>
      );
    }

    return (
      <>
        <DepartmentRolesView
          department={currentDepartment}
          onBack={() => setViewingDepartment(null)}
          onSelectRole={setViewingRole}
          canManage={canManage}
          onRolesChange={handleDepartmentsChange}
        />

        <DepartmentEditorSheet
          open={editorOpen}
          onOpenChange={setEditorOpen}
          departmentId={editingDepartmentId}
          canManage={canManage}
          onSuccess={handleDepartmentsChange}
        />
      </>
    );
  }

  return (
    <>
      <div className="border bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>All departments</CardTitle>
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
                  Delete {selectedIds.size} department
                  {selectedIds.size === 1 ? "" : "s"}
                </Button>
              )}
              <Button size="sm" onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Create department
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
                        aria-label="Select all departments"
                      />
                    </TableHead>
                  )}
                  <TableHead>Department</TableHead>
                  <TableHead>Created by</TableHead>
                  <TableHead>Created on</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Modified by</TableHead>
                  {canManage && (
                    <TableHead className="w-[72px] text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={canManage ? 7 : 6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No departments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  departments.map((department) => (
                    <TableRow
                      key={department._id}
                      className="cursor-pointer hover:bg-muted/50"
                      data-state={
                        selectedIds.has(department._id) ? "selected" : undefined
                      }
                      onClick={() => openDetail(department)}
                    >
                      {canManage && (
                        <TableCell
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Checkbox
                            checked={selectedIds.has(department._id)}
                            onCheckedChange={(value) =>
                              toggleOne(department._id, value === true)
                            }
                            aria-label={`Select ${department.department}`}
                          />
                        </TableCell>
                      )}
                      <TableCell className="font-medium">
                        {department.department}
                      </TableCell>
                      <TableCell>{department.createdBy ?? "—"}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDepartmentDate(department._createdAt)}
                      </TableCell>
                      <TableCell>{department.roleCount}</TableCell>
                      <TableCell>{department.modifiedBy ?? "—"}</TableCell>
                      {canManage && (
                        <TableCell
                          className="text-right"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <DepartmentsTableRowActions
                            department={department}
                            onEdit={openEdit}
                            onDepartmentsChange={handleDepartmentsChange}
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

      <DepartmentEditorSheet
        open={editorOpen}
        onOpenChange={setEditorOpen}
        departmentId={editingDepartmentId}
        canManage={canManage}
        onSuccess={handleDepartmentsChange}
      />

      <DeleteMultipleDepartments
        departments={selectedDepartments}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={handleDeleted}
      />
    </>
  );
}
