import "server-only";

import { createMiddleware } from "hono/factory";
import { requireAuth, requirePermission } from "./session";
import { ForbiddenError, UnauthorizedError } from "./errors";
import type { Permission } from "./permissions";
import type { AuthContext } from "./types";

/**
 * Use at the top of Hono route handlers to enforce authentication.
 */
export async function getApiAuth(): Promise<AuthContext> {
  return requireAuth();
}

/**
 * Use at the top of Hono route handlers to enforce a specific permission.
 */
export async function requireApiPermission(
  permission: Permission
): Promise<AuthContext> {
  return requirePermission(permission);
}

export function authMiddleware(permission?: Permission) {
  return createMiddleware<{
    Variables: { auth: AuthContext };
  }>(async (c, next) => {
    try {
      const session = permission
        ? await requireApiPermission(permission)
        : await getApiAuth();
      c.set("auth", session);
      await next();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      if (error instanceof ForbiddenError) {
        return c.json({ error: "Forbidden" }, 403);
      }
      throw error;
    }
  });
}
