import "server-only";

import { resolvePermissionsFromPersonnel } from "./resolve-personnel-permissions";
import { getAllPersonnel } from "@/sanity/lib/personnel/getAllPersonnel";

export type PersonnelDepartmentRoleAssignment = {
  departmentName: string;
  roleName: string;
};

export type PersonnelAccessRow = {
  _id: string;
  fullName: string;
  email: string;
  status: string;
  appAccessStatus?: string;
  accessLabel: string;
  departments: string[];
  roles: string[];
  assignments: PersonnelDepartmentRoleAssignment[];
  permissionCount: number;
};

type PersonnelRecord = Awaited<ReturnType<typeof getAllPersonnel>>[number];

export async function getPersonnelAccessOverview(): Promise<PersonnelAccessRow[]> {
  const personnel = await getAllPersonnel();

  return personnel.map((person: PersonnelRecord) => {
    const { permissions, assignments, usedAppRoles } =
      resolvePermissionsFromPersonnel(
        person.departmentRoles as Parameters<
          typeof resolvePermissionsFromPersonnel
        >[0]
      );

    const accessLabel =
      usedAppRoles.length > 0
        ? usedAppRoles.join(", ")
        : assignments.length > 0
          ? assignments
              .map((r) => `${r.departmentName} · ${r.roleName}`)
              .join(", ")
          : "No departmental role";

    const departments = [
      ...new Set(assignments.map((assignment) => assignment.departmentName)),
    ];
    const roles = [...new Set(assignments.map((assignment) => assignment.roleName))];

    return {
      _id: person._id,
      fullName: person.fullName,
      email: person.email,
      status: person.status,
      appAccessStatus: person.appAccessStatus,
      accessLabel,
      departments,
      roles,
      assignments,
      permissionCount: permissions.length,
    };
  });
}
