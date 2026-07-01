import "server-only";

import { cache } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { resolveAccess } from "./resolve-access";
import type { Permission } from "./permissions";
import type { AuthContext, SessionContext } from "./types";
import { ForbiddenError, UnauthorizedError } from "./errors";

const UNAUTHENTICATED: SessionContext = {
  userId: null,
  user: null,
  role: null,
  permissions: [],
  userType: null,
  accessLabel: null,
  personnelId: undefined,
  contactPersonId: undefined,
  clientId: undefined,
  departmentRoles: [],
  isAuthenticated: false,
};

type ClerkSessionClaims = {
  email?: string;
  firstName?: string;
  lastName?: string;
  metadata?: Record<string, unknown>;
  public_metadata?: Record<string, unknown>;
};

function getEmailFromClaims(
  claims: ClerkSessionClaims | undefined,
  userId: string
): string {
  return claims?.email ?? "";
}

function getMetadataFromClaims(
  claims: ClerkSessionClaims | undefined
): Record<string, unknown> | undefined {
  const metadata = claims?.metadata ?? claims?.public_metadata;
  return metadata && typeof metadata === "object" ? metadata : undefined;
}

export const getSession = cache(async (): Promise<SessionContext> => {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return UNAUTHENTICATED;
  }

  const claims = sessionClaims as ClerkSessionClaims | undefined;
  const email = getEmailFromClaims(claims, userId);

  if (!email) {
    return UNAUTHENTICATED;
  }

  const access = await resolveAccess(
    userId,
    email,
    getMetadataFromClaims(claims)
  );

  if (access.permissions.length === 0 && access.userType === "pending") {
    return {
      userId,
      user: access.user,
      role: access.role,
      permissions: [],
      userType: access.userType,
      accessLabel: access.accessLabel,
      personnelId: access.personnelId,
      contactPersonId: access.contactPersonId,
      clientId: access.clientId,
      departmentRoles: access.departmentRoles,
      isAuthenticated: true,
    };
  }

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
    departmentRoles: access.departmentRoles,
    isAuthenticated: true,
  };
});

export async function getAuthContext(): Promise<AuthContext | null> {
  const session = await getSession();
  return session.isAuthenticated ? session : null;
}

export async function requireAuth(): Promise<AuthContext> {
  const session = await getSession();

  if (!session.isAuthenticated) {
    throw new UnauthorizedError();
  }

  return session;
}

export async function requireAuthOrRedirect(
  redirectTo = "/sign-in"
): Promise<AuthContext> {
  const session = await getSession();

  if (!session.isAuthenticated) {
    redirect(redirectTo);
  }

  return session;
}

export async function requirePermission(
  permission: Permission
): Promise<AuthContext> {
  const session = await requireAuth();

  if (!session.permissions.includes(permission)) {
    throw new ForbiddenError();
  }

  return session;
}

export async function requireAnyPermission(
  permissions: Permission[]
): Promise<AuthContext> {
  const session = await requireAuth();

  const allowed = permissions.some((p) => session.permissions.includes(p));

  if (!allowed) {
    throw new ForbiddenError();
  }

  return session;
}
