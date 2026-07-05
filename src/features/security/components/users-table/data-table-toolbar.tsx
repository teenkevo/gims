import { Cross2Icon } from "@radix-ui/react-icons";
import { useEffect, useMemo } from "react";
import type { Table } from "@tanstack/react-table";
import type { PersonnelAccessRow } from "@/lib/auth/security-data";
import type { SecurityUserFilterOption } from "@/lib/auth/security-tab-actions";
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeFilterValue } from "./columns";

function matchesNameFilter(person: PersonnelAccessRow, query: string) {
  if (!query) {
    return true;
  }

  return (
    person.fullName.toLowerCase().includes(query) ||
    person.email.toLowerCase().includes(query) ||
    person.departments.some((department) =>
      department.toLowerCase().includes(query)
    ) ||
    person.roles.some((role) => role.toLowerCase().includes(query))
  );
}

interface UsersDataTableToolbarProps {
  table: Table<PersonnelAccessRow>;
  filterOptions: SecurityUserFilterOption[];
}

export function UsersDataTableToolbar({
  table,
  filterOptions,
}: UsersDataTableToolbarProps) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const selectedDepartments =
    (table.getColumn("departments")?.getFilterValue() as string[] | undefined) ??
    [];
  const nameFilter = String(
    table.getColumn("fullName")?.getFilterValue() ?? ""
  )
    .trim()
    .toLowerCase();

  const usersMatchingSearch = useMemo(() => {
    return table
      .getCoreRowModel()
      .rows.map((row) => row.original)
      .filter((person) => matchesNameFilter(person, nameFilter));
  }, [table, nameFilter]);

  const departmentOptions = useMemo(() => {
    return filterOptions.map((department) => {
      const value = normalizeFilterValue(department.name);
      const count = usersMatchingSearch.filter((person) =>
        person.assignments.some(
          (assignment) =>
            normalizeFilterValue(assignment.departmentName) === value
        )
      ).length;

      return {
        value,
        label: department.name,
        count,
      };
    });
  }, [filterOptions, usersMatchingSearch]);

  const roleOptions = useMemo(() => {
    const departmentsToInclude =
      selectedDepartments.length > 0
        ? filterOptions.filter((department) =>
            selectedDepartments.includes(normalizeFilterValue(department.name))
          )
        : filterOptions;

    const roles = new Set<string>();
    for (const department of departmentsToInclude) {
      for (const role of department.roles) {
        roles.add(role);
      }
    }

    return [...roles]
      .sort((a, b) => a.localeCompare(b))
      .map((role) => {
        const value = normalizeFilterValue(role);
        const count = usersMatchingSearch.filter((person) =>
          person.assignments.some((assignment) => {
            if (normalizeFilterValue(assignment.roleName) !== value) {
              return false;
            }

            if (selectedDepartments.length > 0) {
              return selectedDepartments.includes(
                normalizeFilterValue(assignment.departmentName)
              );
            }

            return true;
          })
        ).length;

        return {
          value,
          label: role,
          count,
        };
      });
  }, [filterOptions, selectedDepartments, usersMatchingSearch]);

  useEffect(() => {
    const roleColumn = table.getColumn("roles");
    if (!roleColumn) {
      return;
    }

    const currentRoleFilter =
      (roleColumn.getFilterValue() as string[] | undefined) ?? [];
    if (currentRoleFilter.length === 0) {
      return;
    }

    const validRoleValues = new Set(roleOptions.map((option) => option.value));
    const nextRoleFilter = currentRoleFilter.filter((value) =>
      validRoleValues.has(value)
    );

    if (nextRoleFilter.length !== currentRoleFilter.length) {
      roleColumn.setFilterValue(
        nextRoleFilter.length > 0 ? nextRoleFilter : undefined
      );
    }
  }, [roleOptions, table, selectedDepartments]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        placeholder="Filter users by name or email"
        value={(table.getColumn("fullName")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn("fullName")?.setFilterValue(event.target.value)
        }
        className="h-8 w-[150px] bg-background lg:w-[250px]"
      />
      {table.getColumn("departments") && (
        <DataTableFacetedFilter
          column={table.getColumn("departments")}
          title="Filter by Department"
          contentClassName="w-[320px]"
          options={departmentOptions}
        />
      )}
      {table.getColumn("roles") && (
        <DataTableFacetedFilter
          column={table.getColumn("roles")}
          title="Filter by Role"
          contentClassName="w-[320px]"
          options={roleOptions}
        />
      )}
      {isFiltered && (
        <Button
          variant="ghost"
          onClick={() => table.resetColumnFilters()}
          className="h-8 px-2 lg:px-3"
        >
          Reset
          <Cross2Icon className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
