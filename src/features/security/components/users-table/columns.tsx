"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { PersonnelAccessRow } from "@/lib/auth/security-data";
import { Badge } from "@/components/ui/badge";

export function normalizeFilterValue(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}

function formatList(values: string[]) {
  return values.length > 0 ? values.join(", ") : "—";
}

export function getUsersColumns(
  selectedDepartmentFilters: string[] = []
): ColumnDef<PersonnelAccessRow>[] {
  return [
  {
    accessorKey: "fullName",
    header: "Name",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.fullName}</span>
    ),
    filterFn: (row, _id, value) => {
      const query = String(value ?? "")
        .toLowerCase()
        .trim();
      if (!query) {
        return true;
      }

      const person = row.original;
      return (
        person.fullName.toLowerCase().includes(query) ||
        person.email.toLowerCase().includes(query) ||
        person.departments.some((department) =>
          department.toLowerCase().includes(query)
        ) ||
        person.roles.some((role) => role.toLowerCase().includes(query))
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.original.email,
  },
  {
    accessorKey: "departments",
    header: "Department",
    cell: ({ row }) => (
      <span className="max-w-xs text-sm">
        {formatList(row.original.departments)}
      </span>
    ),
    filterFn: (row, _id, value) => {
      const filterValues = value as string[] | undefined;
      if (!filterValues?.length) {
        return true;
      }

      return row.original.assignments.some((assignment) =>
        filterValues.includes(normalizeFilterValue(assignment.departmentName))
      );
    },
  },
  {
    accessorKey: "roles",
    header: "Role",
    cell: ({ row }) => (
      <span className="max-w-xs text-sm">{formatList(row.original.roles)}</span>
    ),
    filterFn: (row, _id, value) => {
      const filterValues = value as string[] | undefined;
      if (!filterValues?.length) {
        return true;
      }

      return row.original.assignments.some((assignment) => {
        if (!filterValues.includes(normalizeFilterValue(assignment.roleName))) {
          return false;
        }

        if (selectedDepartmentFilters.length > 0) {
          return selectedDepartmentFilters.includes(
            normalizeFilterValue(assignment.departmentName)
          );
        }

        return true;
      });
    },
  },
  {
    accessorKey: "appAccessStatus",
    header: "App access",
    cell: ({ row }) => (
      <Badge variant="secondary">
        {row.original.appAccessStatus ?? "none"}
      </Badge>
    ),
  },
  {
    accessorKey: "permissionCount",
    header: "Permissions",
    cell: ({ row }) => `${row.original.permissionCount} granted`,
  },
];
}
