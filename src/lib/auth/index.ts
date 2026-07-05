export { ROLES, ROLE_LABELS, ALL_ROLES, INTERNAL_ROLES, DEFAULT_ROLE, isRole, parseRole } from "./roles";
export type { Role } from "./roles";

export { PERMISSIONS, ALL_PERMISSIONS, ROLE_PERMISSIONS, getPermissionsForRole, roleHasPermission } from "./permissions";
export type { Permission } from "./permissions";

export { can, canAny, canAll, hasRole, hasAnyRole, isInternalUser, isClientUser, checkPermission } from "./authorize";

export {
  getSession,
  getAuthContext,
  requireAuth,
  requireAuthOrRedirect,
  requirePermission,
  requireAnyPermission,
} from "./session";

export type { UserType } from "./user-type";
export { USER_TYPES } from "./user-type";
export {
  DEPARTMENT_ROLE_PERMISSIONS,
  getPermissionsForDepartmentRole,
  unionPermissions,
  formatDepartmentRoleLabel,
} from "./department-role-permissions";
export type { DepartmentRoleAssignment } from "./department-role-permissions";
export { resolveAccess } from "./resolve-access";
export { getMyAccess } from "./get-my-access";
export { createAuditLog, logPermissionDenied } from "./audit-log";
export {
  withAuth,
  withAuthenticatedAction,
  requirePermissionOrError,
} from "./with-auth";
export { authMiddleware, getApiAuth, requireApiPermission } from "./api";

export {
  FORBIDDEN_ACTION_CODE,
  getPermissionActionLabel,
  getActionErrorMessage,
  isForbiddenActionResult,
  unauthorizedActionMessage,
  type ActionErrorResult,
} from "./action-errors";
export { toastActionError } from "./notify-action-error";

export { AuthError, UnauthorizedError, ForbiddenError } from "./errors";

export type { AuthUser, AuthContext, SessionContext, AuditAction, AuditLogInput } from "./types";
