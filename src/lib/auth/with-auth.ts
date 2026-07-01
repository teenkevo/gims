import "server-only";

import type { Permission } from "./permissions";
import { requireAuth, requirePermission } from "./session";
import type { AuthContext } from "./types";

type ServerAction<TArgs extends unknown[], TResult> = (
  ...args: TArgs
) => Promise<TResult>;

/**
 * Wrap a server action to require a specific permission.
 *
 * @example
 * export const deleteProject = withAuth(
 *   PERMISSIONS["projects:delete"],
 *   async (session, projectId: string) => { ... }
 * );
 */
export function withAuth<TArgs extends unknown[], TResult>(
  permission: Permission,
  handler: (session: AuthContext, ...args: TArgs) => Promise<TResult>
): ServerAction<TArgs, TResult> {
  return async (...args: TArgs) => {
    const session = await requirePermission(permission);
    return handler(session, ...args);
  };
}

/**
 * Wrap a server action to require only authentication.
 */
export function withAuthenticatedAction<TArgs extends unknown[], TResult>(
  handler: (session: AuthContext, ...args: TArgs) => Promise<TResult>
): ServerAction<TArgs, TResult> {
  return async (...args: TArgs) => {
    const session = await requireAuth();
    return handler(session, ...args);
  };
}
