import type { Permission } from "./permissions";
import {
  getPermissionSetsForDepartmentRole,
  type DepartmentRolePermissionSetsSource,
} from "@/lib/auth/department-role-permission-sets";
import {
  getPermissionsForDepartmentRole,
  unionPermissions,
  type DepartmentRoleAssignment,
} from "./department-role-permissions";

type DepartmentRoleDef = DepartmentRolePermissionSetsSource & {
  roleName?: string;
};

type PersonnelDepartmentRole = {
  role: string;
  department: {
    department: string;
    roles?: DepartmentRoleDef[];
  } | null;
};

export function resolvePermissionsFromPersonnel(
  departmentRoles: PersonnelDepartmentRole[] | undefined
): {
  permissions: Permission[];
  assignments: DepartmentRoleAssignment[];
  usedAppRoles: string[];
} {
  const permissions = new Set<Permission>();
  const assignments: DepartmentRoleAssignment[] = [];
  const usedAppRoles: string[] = [];

  for (const entry of departmentRoles ?? []) {
    if (!entry.department?.department || !entry.role) continue;

    assignments.push({
      departmentName: entry.department.department,
      roleName: entry.role,
    });

    const deptRoleDef = entry.department.roles?.find(
      (r) => r.roleName?.toLowerCase() === entry.role.toLowerCase()
    );

    const permissionSets = getPermissionSetsForDepartmentRole(deptRoleDef);

    if (permissionSets.length > 0) {
      for (const appRole of permissionSets) {
        for (const permission of appRole.permissions ?? []) {
          permissions.add(permission as Permission);
        }
        if (appRole.name) {
          usedAppRoles.push(appRole.name);
        }
      }
      continue;
    }

    for (const permission of getPermissionsForDepartmentRole(
      entry.department.department,
      entry.role
    )) {
      permissions.add(permission);
    }
  }

  return {
    permissions: [...permissions],
    assignments,
    usedAppRoles,
  };
}
