import type { Permission } from "./permissions";
import type { Role } from "./roles";
import type { UserType } from "./user-type";
import type { DepartmentRoleAssignment } from "./department-role-permissions";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string;
  imageUrl: string | null;
}

export interface AuthContext {
  userId: string;
  user: AuthUser;
  role: Role;
  permissions: Permission[];
  userType: UserType;
  accessLabel: string;
  personnelId?: string;
  contactPersonId?: string;
  clientId?: string;
  departmentRoles: DepartmentRoleAssignment[];
  isAuthenticated: true;
}

export interface UnauthenticatedContext {
  userId: null;
  user: null;
  role: null;
  permissions: [];
  userType: null;
  accessLabel: null;
  personnelId: undefined;
  contactPersonId: undefined;
  clientId: undefined;
  departmentRoles: [];
  isAuthenticated: false;
}

export type SessionContext = AuthContext | UnauthenticatedContext;

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "read"
  | "login"
  | "logout"
  | "permission_denied"
  | "role_assigned"
  | "role_revoked"
  | "personnel_invited";

export interface AuditLogInput {
  action: AuditAction;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}
