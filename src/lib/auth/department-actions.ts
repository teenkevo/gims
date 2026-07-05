"use server";

import { revalidatePath } from "next/cache";
import { revalidateTag } from "next/cache";
import { writeClient } from "@/sanity/lib/write-client";
import { requirePermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/permissions";

export type DepartmentRoleInput = {
  roleName: string;
  appRoleId?: string;
  appRoleIds?: string[];
};

function resolveAppRoleIds(role: DepartmentRoleInput): string[] {
  if (role.appRoleIds?.length) {
    return role.appRoleIds;
  }
  if (role.appRoleId) {
    return [role.appRoleId];
  }
  return [];
}

function toSanityRoles(roles: DepartmentRoleInput[]) {
  return roles.map((role) => {
    const appRoleIds = resolveAppRoleIds(role);

    return {
      _type: "object" as const,
      roleName: role.roleName.trim(),
      ...(appRoleIds.length > 0
        ? {
            appRoles: appRoleIds.map((id) => ({
              _type: "reference" as const,
              _ref: id,
            })),
          }
        : {}),
    };
  });
}

async function touchDepartmentModified(departmentId: string, actor: string) {
  await writeClient.patch(departmentId).set({ modifiedBy: actor }).commit();
}

export async function assignPersonnelToDepartment(input: {
  personnelId: string;
  departmentId: string;
  role: string;
}) {
  const session = await requirePermission(PERMISSIONS["security:manage"]);
  const actor = session.user.fullName || session.user.email;

  const personnel = await writeClient.fetch<{
    departmentRoles?: Array<{
      _key?: string;
      department?: { _ref?: string };
      role?: string;
    }>;
  } | null>(
    `*[_type == "personnel" && _id == $personnelId][0]{ departmentRoles }`,
    { personnelId: input.personnelId }
  );

  if (!personnel) {
    throw new Error("Personnel not found");
  }

  const department = await writeClient.fetch<{ department?: string } | null>(
    `*[_type == "department" && _id == $departmentId][0]{ department }`,
    { departmentId: input.departmentId }
  );

  if (!department) {
    throw new Error("Department not found");
  }

  const existingRoles = personnel.departmentRoles ?? [];
  const existingIndex = existingRoles.findIndex(
    (entry) => entry.department?._ref === input.departmentId
  );

  const nextDepartmentRoles =
    existingIndex >= 0
      ? existingRoles.map((entry, index) =>
          index === existingIndex
            ? {
                ...entry,
                _type: "object" as const,
                department: {
                  _type: "reference" as const,
                  _ref: input.departmentId,
                },
                role: input.role,
              }
            : entry
        )
      : [
          ...existingRoles,
          {
            _type: "object" as const,
            department: {
              _type: "reference" as const,
              _ref: input.departmentId,
            },
            role: input.role,
          },
        ];

  await writeClient
    .patch(input.personnelId)
    .set({ departmentRoles: nextDepartmentRoles })
    .commit({ autoGenerateArrayKeys: true });

  await touchDepartmentModified(input.departmentId, actor);
  revalidatePath("/security");
  revalidateTag("personnel");
}

export async function createDepartment(input: {
  name: string;
  roles: DepartmentRoleInput[];
}) {
  const session = await requirePermission(PERMISSIONS["security:manage"]);
  const actor = session.user.fullName || session.user.email;

  const result = await writeClient.create({
    _type: "department",
    department: input.name.trim(),
    roles: toSanityRoles(input.roles),
    createdBy: actor,
  });

  revalidatePath("/security");
  revalidateTag("personnel");
  return { id: result._id };
}

export async function updateDepartment(input: {
  id: string;
  name: string;
  roles: DepartmentRoleInput[];
}) {
  const session = await requirePermission(PERMISSIONS["security:manage"]);
  const actor = session.user.fullName || session.user.email;

  const existing = await writeClient.fetch<{ _id: string } | null>(
    `*[_type == "department" && _id == $id][0]{ _id }`,
    { id: input.id }
  );

  if (!existing) {
    throw new Error("Department not found");
  }

  await writeClient
    .patch(input.id)
    .set({
      department: input.name.trim(),
      roles: toSanityRoles(input.roles),
      modifiedBy: actor,
    })
    .commit({ autoGenerateArrayKeys: true });

  revalidatePath("/security");
  revalidateTag("personnel");
}

export async function deleteDepartments(ids: string[]) {
  await requirePermission(PERMISSIONS["security:manage"]);

  if (ids.length === 0) {
    return { deletedCount: 0, blocked: [] as string[] };
  }

  const departments = await writeClient.fetch<
    Array<{ _id: string; department?: string; personnelCount: number }>
  >(
    `*[_type == "department" && _id in $ids]{
      _id,
      department,
      "personnelCount": count(*[_type == "personnel" && references(^._id)])
    }`,
    { ids }
  );

  const blocked = departments
    .filter((department) => department.personnelCount > 0)
    .map((department) => department.department ?? department._id);

  const deletableIds = departments
    .filter((department) => department.personnelCount === 0)
    .map((department) => department._id);

  await Promise.all(deletableIds.map((id) => writeClient.delete(id)));

  revalidatePath("/security");
  revalidateTag("personnel");

  return {
    deletedCount: deletableIds.length,
    blocked,
  };
}

export async function removeDepartmentRoles(
  departmentId: string,
  roleNames: string[]
) {
  const session = await requirePermission(PERMISSIONS["security:manage"]);
  const actor = session.user.fullName || session.user.email;

  if (roleNames.length === 0) {
    return { removedCount: 0, blocked: [] as string[] };
  }

  const department = await writeClient.fetch<{
    roles?: Array<{
      roleName?: string;
      appRole?: { _id: string } | null;
      appRoles?: Array<{ _id: string } | null> | null;
    }>;
  } | null>(
    `*[_type == "department" && _id == $departmentId][0]{
      roles[] {
        roleName,
        appRole->{ _id },
        appRoles[]->{ _id }
      }
    }`,
    { departmentId }
  );

  if (!department) {
    throw new Error("Department not found");
  }

  const personnel = await writeClient.fetch<
    Array<{
      departmentRoles?: Array<{
        role?: string;
        department?: { _ref?: string };
      }>;
    }>
  >(
    `*[_type == "personnel" && references($departmentId)]{ departmentRoles }`,
    { departmentId }
  );

  const rolesInUse = new Set<string>();
  for (const person of personnel ?? []) {
    for (const entry of person.departmentRoles ?? []) {
      if (entry.department?._ref === departmentId && entry.role) {
        rolesInUse.add(entry.role);
      }
    }
  }

  const blocked = roleNames.filter((name) => rolesInUse.has(name));
  const removable = new Set(
    roleNames.filter((name) => !rolesInUse.has(name))
  );

  const remainingRoles: DepartmentRoleInput[] = (department.roles ?? [])
    .filter((role) => role.roleName && !removable.has(role.roleName))
    .map((role) => ({
      roleName: role.roleName as string,
      appRoleIds: getRoleAppRoleIds(role),
    }));

  if (removable.size === 0) {
    return { removedCount: 0, blocked };
  }

  await writeClient
    .patch(departmentId)
    .set({
      roles: toSanityRoles(remainingRoles),
      modifiedBy: actor,
    })
    .commit({ autoGenerateArrayKeys: true });

  revalidatePath("/security");
  revalidateTag("personnel");

  return {
    removedCount: removable.size,
    blocked,
  };
}

async function fetchDepartmentRoleEntries(departmentId: string) {
  return writeClient.fetch<{
    department?: string;
    roles?: Array<{
      roleName?: string;
      appRole?: { _id: string } | null;
      appRoles?: Array<{ _id: string } | null> | null;
    }>;
  } | null>(
    `*[_type == "department" && _id == $departmentId][0]{
      department,
      roles[] {
        roleName,
        appRole->{ _id },
        appRoles[]->{ _id }
      }
    }`,
    { departmentId }
  );
}

function getRoleAppRoleIds(role: {
  appRole?: { _id: string } | null;
  appRoles?: Array<{ _id: string } | null> | null;
}): string[] {
  if (role.appRoles?.length) {
    return role.appRoles
      .filter((entry): entry is { _id: string } => Boolean(entry?._id))
      .map((entry) => entry._id);
  }

  if (role.appRole?._id) {
    return [role.appRole._id];
  }

  return [];
}

function mapDepartmentRoles(
  roles: Array<{
    roleName?: string;
    appRole?: { _id: string } | null;
    appRoles?: Array<{ _id: string } | null> | null;
  }>
): DepartmentRoleInput[] {
  return roles
    .filter((role) => role.roleName)
    .map((role) => ({
      roleName: role.roleName as string,
      appRoleIds: getRoleAppRoleIds(role),
    }));
}

export async function addDepartmentRole(
  departmentId: string,
  role: DepartmentRoleInput
) {
  const session = await requirePermission(PERMISSIONS["security:manage"]);
  const actor = session.user.fullName || session.user.email;

  const department = await fetchDepartmentRoleEntries(departmentId);
  if (!department) {
    throw new Error("Department not found");
  }

  const trimmedName = role.roleName.trim();
  if (!trimmedName) {
    throw new Error("Role name is required");
  }

  const existingRoles = mapDepartmentRoles(department.roles ?? []);
  const nameExists = existingRoles.some(
    (entry) => entry.roleName.toLowerCase() === trimmedName.toLowerCase()
  );

  if (nameExists) {
    throw new Error("A role with this name already exists in the department");
  }

  await writeClient
    .patch(departmentId)
    .set({
      roles: toSanityRoles([
        ...existingRoles,
        {
          roleName: trimmedName,
          appRoleIds: resolveAppRoleIds(role),
        },
      ]),
      modifiedBy: actor,
    })
    .commit({ autoGenerateArrayKeys: true });

  revalidatePath("/security");
  revalidateTag("personnel");
}

export async function updateDepartmentRole(
  departmentId: string,
  currentRoleName: string,
  role: DepartmentRoleInput
) {
  const session = await requirePermission(PERMISSIONS["security:manage"]);
  const actor = session.user.fullName || session.user.email;

  const department = await fetchDepartmentRoleEntries(departmentId);
  if (!department) {
    throw new Error("Department not found");
  }

  const trimmedName = role.roleName.trim();
  if (!trimmedName) {
    throw new Error("Role name is required");
  }

  const existingRoles = mapDepartmentRoles(department.roles ?? []);
  const roleIndex = existingRoles.findIndex(
    (entry) => entry.roleName === currentRoleName
  );

  if (roleIndex < 0) {
    throw new Error("Role not found");
  }

  const renaming = trimmedName !== currentRoleName;
  if (
    renaming &&
    existingRoles.some(
      (entry) =>
        entry.roleName.toLowerCase() === trimmedName.toLowerCase() &&
        entry.roleName !== currentRoleName
    )
  ) {
    throw new Error("A role with this name already exists in the department");
  }

  const nextRoles = existingRoles.map((entry, index) =>
    index === roleIndex
      ? {
          roleName: trimmedName,
          appRoleIds: role.appRoleIds ?? resolveAppRoleIds(role),
        }
      : entry
  );

  await writeClient
    .patch(departmentId)
    .set({
      roles: toSanityRoles(nextRoles),
      modifiedBy: actor,
    })
    .commit({ autoGenerateArrayKeys: true });

  if (renaming) {
    const personnel = await writeClient.fetch<
      Array<{
        _id: string;
        departmentRoles?: Array<{
          _key?: string;
          role?: string;
          department?: { _ref?: string };
        }>;
      }>
    >(
      `*[_type == "personnel" && references($departmentId)]{
        _id,
        departmentRoles[] {
          _key,
          role,
          department
        }
      }`,
      { departmentId }
    );

    await Promise.all(
      (personnel ?? []).map(async (person) => {
        const hasRole = person.departmentRoles?.some(
          (entry) =>
            entry.department?._ref === departmentId &&
            entry.role === currentRoleName
        );

        if (!hasRole) return;

        const nextDepartmentRoles = person.departmentRoles?.map((entry) => {
          if (
            entry.department?._ref === departmentId &&
            entry.role === currentRoleName
          ) {
            return {
              _type: "object" as const,
              _key: entry._key,
              department: entry.department,
              role: trimmedName,
            };
          }
          return entry;
        });

        await writeClient
          .patch(person._id)
          .set({ departmentRoles: nextDepartmentRoles })
          .commit({ autoGenerateArrayKeys: true });
      })
    );
  }

  revalidatePath("/security");
  revalidateTag("personnel");
}

export async function updateDepartmentRolePermissionSets(
  departmentId: string,
  roleName: string,
  appRoleIds: string[]
) {
  const session = await requirePermission(PERMISSIONS["security:manage"]);
  const actor = session.user.fullName || session.user.email;

  const department = await fetchDepartmentRoleEntries(departmentId);
  if (!department) {
    throw new Error("Department not found");
  }

  const existingRoles = mapDepartmentRoles(department.roles ?? []);
  const roleIndex = existingRoles.findIndex((entry) => entry.roleName === roleName);

  if (roleIndex < 0) {
    throw new Error("Role not found");
  }

  const nextRoles = existingRoles.map((entry, index) =>
    index === roleIndex ? { ...entry, appRoleIds } : entry
  );

  await writeClient
    .patch(departmentId)
    .set({
      roles: toSanityRoles(nextRoles),
      modifiedBy: actor,
    })
    .commit({ autoGenerateArrayKeys: true });

  revalidatePath("/security");
  revalidateTag("personnel");
}
