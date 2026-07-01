"use server";

import { revalidatePath } from "next/cache";
import { revalidateTag } from "next/cache";
import { writeClient } from "@/sanity/lib/write-client";
import { requirePermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/permissions";

export type DepartmentRoleInput = {
  roleName: string;
  appRoleId?: string;
};

function toSanityRoles(roles: DepartmentRoleInput[]) {
  return roles.map((role) => ({
    _type: "object" as const,
    roleName: role.roleName.trim(),
    ...(role.appRoleId
      ? {
          appRole: { _type: "reference" as const, _ref: role.appRoleId },
        }
      : {}),
  }));
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
