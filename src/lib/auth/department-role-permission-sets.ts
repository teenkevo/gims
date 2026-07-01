export type AppRoleRef = {
  _id: string;
  name?: string;
  permissions?: string[];
};

export type DepartmentRolePermissionSetsSource = {
  appRole?: { _id: string; name?: string; permissions?: string[] } | null;
  appRoles?: Array<{ _id: string; name?: string; permissions?: string[] } | null> | null;
};

export function getPermissionSetsForDepartmentRole(
  roleDef?: DepartmentRolePermissionSetsSource | null
): AppRoleRef[] {
  if (!roleDef) return [];

  if (roleDef.appRoles?.length) {
    return roleDef.appRoles.filter((role): role is AppRoleRef => Boolean(role?._id));
  }

  if (roleDef.appRole?._id) {
    return [roleDef.appRole];
  }

  return [];
}

export function getPermissionSetIdsForDepartmentRole(
  roleDef?: DepartmentRolePermissionSetsSource | null
): string[] {
  return getPermissionSetsForDepartmentRole(roleDef).map((role) => role._id);
}
