import type { SessionContext } from "./types";
import { USER_TYPES } from "./user-type";
import type { Role } from "./roles";

export function can(
  session: SessionContext,
  permission: import("./permissions").Permission
): boolean {
  if (!session.isAuthenticated) return false;
  return session.permissions.includes(permission);
}

export function canAny(
  session: SessionContext,
  permissions: import("./permissions").Permission[]
): boolean {
  return permissions.some((permission) => can(session, permission));
}

export function canAll(
  session: SessionContext,
  permissions: import("./permissions").Permission[]
): boolean {
  return permissions.every((permission) => can(session, permission));
}

export function hasRole(session: SessionContext, role: Role): boolean {
  if (!session.isAuthenticated) return false;
  return session.role === role;
}

export function hasAnyRole(session: SessionContext, roles: Role[]): boolean {
  if (!session.isAuthenticated) return false;
  return roles.includes(session.role);
}

export function isInternalUser(session: SessionContext): boolean {
  if (!session.isAuthenticated) return false;
  return session.userType === USER_TYPES.INTERNAL;
}

export function isClientUser(session: SessionContext): boolean {
  if (!session.isAuthenticated) return false;
  return session.userType === USER_TYPES.CLIENT;
}

export function checkPermission(
  session: SessionContext,
  permission: import("./permissions").Permission
): boolean {
  return can(session, permission);
}
