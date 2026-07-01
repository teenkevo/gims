import type { Permission } from "./permissions";
import {
  getPermissionsForDepartmentRole,
  unionPermissions,
  type DepartmentRoleAssignment,
} from "./department-role-permissions";

type DepartmentRoleDef = {
  roleName?: string;
  appRole?: {
    _id: string;
    name: string;
    permissions?: string[];
  } | null;
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

    if (
      deptRoleDef?.appRole?.permissions &&
      deptRoleDef.appRole.permissions.length > 0
    ) {
      for (const permission of deptRoleDef.appRole.permissions) {
        permissions.add(permission as Permission);
      }
      if (deptRoleDef.appRole.name) {
        usedAppRoles.push(deptRoleDef.appRole.name);
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
