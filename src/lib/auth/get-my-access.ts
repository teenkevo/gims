"use server";

import { auth } from "@clerk/nextjs/server";
import { resolveAccess } from "./resolve-access";

export async function getMyAccess(clientEmail?: string) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return null;
  }

  const claims = sessionClaims as {
    email?: string;
    metadata?: Record<string, unknown>;
    public_metadata?: Record<string, unknown>;
  };

  const email = clientEmail ?? claims?.email ?? "";
  if (!email) {
    return null;
  }

  const metadata = claims?.metadata ?? claims?.public_metadata;
  const access = await resolveAccess(
    userId,
    email,
    metadata && typeof metadata === "object" ? metadata : undefined
  );

  return {
    userId,
    user: access.user,
    role: access.role,
    permissions: access.permissions,
    userType: access.userType,
    accessLabel: access.accessLabel,
    personnelId: access.personnelId,
    contactPersonId: access.contactPersonId,
    clientId: access.clientId,
    clientName: access.clientName,
    departmentRoles: access.departmentRoles,
  };
}
