"use server";

import { revalidatePath } from "next/cache";
import { writeClient } from "@/sanity/lib/write-client";
import { requirePermission } from "@/lib/auth/session";
import { PERMISSIONS, type Permission } from "@/lib/auth/permissions";
import { createAuditLog } from "@/lib/auth/audit-log";

export async function createAppRole(input: {
  name: string;
  permissions: Permission[];
}) {
  const session = await requirePermission(PERMISSIONS["security:manage"]);
  const actor = session.user.fullName || session.user.email;

  const slug = input.name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const result = await writeClient.create({
    _type: "appRole",
    name: input.name.trim(),
    slug: { _type: "slug", current: slug },
    permissions: input.permissions,
    isSystem: false,
    createdBy: actor,
  });

  await createAuditLog(session, {
    action: "create",
    resource: "appRole",
    resourceId: result._id,
    metadata: { name: input.name, permissionCount: input.permissions.length },
  });

  revalidatePath("/security");
  return { id: result._id };
}

export async function updateAppRole(input: {
  id: string;
  name: string;
  permissions: Permission[];
}) {
  const session = await requirePermission(PERMISSIONS["security:manage"]);
  const actor = session.user.fullName || session.user.email;

  const existing = await writeClient.fetch<{ isSystem?: boolean } | null>(
    `*[_type == "appRole" && _id == $id][0]{ isSystem }`,
    { id: input.id }
  );

  if (!existing) {
    throw new Error("Role not found");
  }

  const slug = input.name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  await writeClient
    .patch(input.id)
    .set({
      name: input.name.trim(),
      slug: { _type: "slug", current: slug },
      permissions: input.permissions,
      modifiedBy: actor,
    })
    .commit();

  await createAuditLog(session, {
    action: "update",
    resource: "appRole",
    resourceId: input.id,
    metadata: { name: input.name, permissionCount: input.permissions.length },
  });

  revalidatePath("/security");
}

export async function deleteAppRole(id: string) {
  const session = await requirePermission(PERMISSIONS["security:manage"]);

  const existing = await writeClient.fetch<{
    name: string;
    isSystem?: boolean;
  } | null>(`*[_type == "appRole" && _id == $id][0]{ name, isSystem }`, { id });

  if (!existing) {
    throw new Error("Role not found");
  }

  if (existing.isSystem) {
    throw new Error("System roles cannot be deleted");
  }

  const inUse = await writeClient.fetch<number>(
    `count(*[_type == "department" && references($id)])`,
    { id }
  );

  if (inUse > 0) {
    throw new Error("Role is in use and cannot be deleted. Archive it instead.");
  }

  await writeClient.delete(id);

  await createAuditLog(session, {
    action: "delete",
    resource: "appRole",
    resourceId: id,
    metadata: { name: existing.name },
  });

  revalidatePath("/security");
}

export async function archiveAppRole(id: string) {
  const session = await requirePermission(PERMISSIONS["security:manage"]);
  const actor = session.user.fullName || session.user.email;

  const existing = await writeClient.fetch<{
    name: string;
    isSystem?: boolean;
    archived?: boolean;
  } | null>(
    `*[_type == "appRole" && _id == $id][0]{ name, isSystem, archived }`,
    { id }
  );

  if (!existing) {
    throw new Error("Role not found");
  }

  if (existing.isSystem) {
    throw new Error("System roles cannot be archived");
  }

  if (existing.archived) {
    throw new Error("Role is already archived");
  }

  const inUse = await writeClient.fetch<number>(
    `count(*[_type == "department" && references($id)])`,
    { id }
  );

  if (inUse === 0) {
    throw new Error("Only roles in use can be archived. Delete unused roles instead.");
  }

  await writeClient
    .patch(id)
    .set({
      archived: true,
      modifiedBy: actor,
    })
    .commit();

  await createAuditLog(session, {
    action: "update",
    resource: "appRole",
    resourceId: id,
    metadata: { name: existing.name, archived: true },
  });

  revalidatePath("/security");
}

export async function deleteAppRoles(ids: string[]) {
  const session = await requirePermission(PERMISSIONS["security:manage"]);

  if (ids.length === 0) {
    return { deletedCount: 0, blocked: [] as string[] };
  }

  const roles = await writeClient.fetch<
    Array<{
      _id: string;
      name?: string;
      isSystem?: boolean;
      archived?: boolean;
      inUse: boolean;
    }>
  >(
    `*[_type == "appRole" && _id in $ids]{
      _id,
      name,
      isSystem,
      archived,
      "inUse": count(*[_type == "department" && references(^._id)]) > 0
    }`,
    { ids }
  );

  const blocked = roles
    .filter(
      (role) => role.isSystem || role.archived || role.inUse
    )
    .map((role) => role.name ?? role._id);

  const deletableRoles = roles.filter(
    (role) => !role.isSystem && !role.archived && !role.inUse
  );

  await Promise.all(
    deletableRoles.map(async (role) => {
      await writeClient.delete(role._id);
      await createAuditLog(session, {
        action: "delete",
        resource: "appRole",
        resourceId: role._id,
        metadata: { name: role.name },
      });
    })
  );

  revalidatePath("/security");

  return {
    deletedCount: deletableRoles.length,
    blocked,
  };
}

export async function refreshSecurityPage() {
  revalidatePath("/security");
}
