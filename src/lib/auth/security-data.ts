import "server-only";

import {
  DEPARTMENT_ROLE_PERMISSIONS,
  formatDepartmentRoleLabel,
  getPermissionsForDepartmentRole,
  type DepartmentRoleAssignment,
} from "./department-role-permissions";
import { getAllPersonnel } from "@/sanity/lib/personnel/getAllPersonnel";
import type { Permission } from "./permissions";

type PersonnelRecord = Awaited<ReturnType<typeof getAllPersonnel>>[number];

export type PermissionMatrixRow = {
  key: string;
  departmentName: string;
  roleName: string;
  permissions: Permission[];
};

export type PersonnelAccessRow = {
  _id: string;
  fullName: string;
  email: string;
  status: string;
  appAccessStatus?: string;
  accessLabel: string;
  permissionCount: number;
};

function parseMatrixKey(key: string): { departmentName: string; roleName: string } {
  const [departmentName, roleName] = key.split("::");
  if (departmentName === "*") {
    return { departmentName: "Any department", roleName: roleName ?? key };
  }
  return {
    departmentName: departmentName
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    roleName: roleName
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
  };
}

export function getPermissionMatrix(): PermissionMatrixRow[] {
  return Object.entries(DEPARTMENT_ROLE_PERMISSIONS).map(([key, permissions]) => {
    const { departmentName, roleName } = parseMatrixKey(key);
    return {
      key,
      departmentName,
      roleName,
      permissions,
    };
  });
}

export async function getPersonnelAccessOverview(): Promise<PersonnelAccessRow[]> {
  const personnel = await getAllPersonnel();

  return personnel.map((person: PersonnelRecord) => {
    const departmentRoles: DepartmentRoleAssignment[] =
      person.departmentRoles
        ?.filter(
          (entry: PersonnelRecord["departmentRoles"][number]) =>
            entry.department?.department && entry.role
        )
        .map((entry: PersonnelRecord["departmentRoles"][number]) => ({
          departmentName: entry.department!.department,
          roleName: entry.role,
        })) ?? [];

    const permissions = new Set<Permission>();
    for (const assignment of departmentRoles) {
      for (const permission of getPermissionsForDepartmentRole(
        assignment.departmentName,
        assignment.roleName
      )) {
        permissions.add(permission);
      }
    }

    const accessLabel =
      departmentRoles.length > 0
        ? departmentRoles
            .map((r: DepartmentRoleAssignment) =>
              formatDepartmentRoleLabel(r.departmentName, r.roleName)
            )
            .join(", ")
        : "No departmental role";

    return {
      _id: person._id,
      fullName: person.fullName,
      email: person.email,
      status: person.status,
      appAccessStatus: (person as PersonnelRecord & { appAccessStatus?: string })
        .appAccessStatus,
      accessLabel,
      permissionCount: permissions.size,
    };
  });
}
