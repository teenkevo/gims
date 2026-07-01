import { ROLES, type Role } from "./roles";

export const PERMISSIONS = {
  // Projects
  "projects:read": "projects:read",
  "projects:create": "projects:create",
  "projects:update": "projects:update",
  "projects:delete": "projects:delete",

  // Clients
  "clients:read": "clients:read",
  "clients:create": "clients:create",
  "clients:update": "clients:update",
  "clients:delete": "clients:delete",

  // Services
  "services:read": "services:read",
  "services:create": "services:create",
  "services:update": "services:update",
  "services:delete": "services:delete",

  // Labs
  "labs:read": "labs:read",
  "labs:create": "labs:create",
  "labs:update": "labs:update",
  "labs:delete": "labs:delete",

  // Equipment
  "equipment:read": "equipment:read",
  "equipment:create": "equipment:create",
  "equipment:update": "equipment:update",
  "equipment:delete": "equipment:delete",

  // Personnel
  "personnel:read": "personnel:read",
  "personnel:create": "personnel:create",
  "personnel:update": "personnel:update",
  "personnel:delete": "personnel:delete",

  // RFIs
  "rfi:read": "rfi:read",
  "rfi:create": "rfi:create",
  "rfi:update": "rfi:update",
  "rfi:delete": "rfi:delete",

  // Billing
  "billing:read": "billing:read",
  "billing:create": "billing:create",
  "billing:update": "billing:update",
  "billing:delete": "billing:delete",
  "billing:manage": "billing:manage",

  // Security & audit
  "security:read": "security:read",
  "security:manage": "security:manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);

const ALL_EXCEPT_SECURITY_MANAGE = ALL_PERMISSIONS.filter(
  (p) => p !== PERMISSIONS["security:manage"]
);

const INTERNAL_READ_PERMISSIONS: Permission[] = [
  PERMISSIONS["projects:read"],
  PERMISSIONS["clients:read"],
  PERMISSIONS["services:read"],
  PERMISSIONS["labs:read"],
  PERMISSIONS["equipment:read"],
  PERMISSIONS["personnel:read"],
  PERMISSIONS["rfi:read"],
  PERMISSIONS["billing:read"],
];

const INTERNAL_WRITE_PERMISSIONS: Permission[] = [
  PERMISSIONS["projects:create"],
  PERMISSIONS["projects:update"],
  PERMISSIONS["clients:create"],
  PERMISSIONS["clients:update"],
  PERMISSIONS["services:create"],
  PERMISSIONS["services:update"],
  PERMISSIONS["labs:create"],
  PERMISSIONS["labs:update"],
  PERMISSIONS["equipment:create"],
  PERMISSIONS["equipment:update"],
  PERMISSIONS["personnel:create"],
  PERMISSIONS["personnel:update"],
  PERMISSIONS["rfi:create"],
  PERMISSIONS["rfi:update"],
  PERMISSIONS["billing:create"],
  PERMISSIONS["billing:update"],
];

const INTERNAL_DELETE_PERMISSIONS: Permission[] = [
  PERMISSIONS["projects:delete"],
  PERMISSIONS["clients:delete"],
  PERMISSIONS["services:delete"],
  PERMISSIONS["labs:delete"],
  PERMISSIONS["equipment:delete"],
  PERMISSIONS["personnel:delete"],
  PERMISSIONS["rfi:delete"],
  PERMISSIONS["billing:delete"],
];

const CLIENT_PERMISSIONS: Permission[] = [
  PERMISSIONS["projects:read"],
  PERMISSIONS["billing:read"],
  PERMISSIONS["rfi:read"],
  PERMISSIONS["rfi:create"],
  PERMISSIONS["rfi:update"],
];

/**
 * Role → permission mapping. Module-specific rules can be tightened later
 * without changing the auth helper API.
 */
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  [ROLES.SUPER_ADMIN]: ALL_PERMISSIONS,
  [ROLES.ADMIN]: [...ALL_EXCEPT_SECURITY_MANAGE, PERMISSIONS["security:read"]],
  [ROLES.EDITOR]: [...INTERNAL_READ_PERMISSIONS, ...INTERNAL_WRITE_PERMISSIONS],
  [ROLES.VIEWER]: INTERNAL_READ_PERMISSIONS,
  [ROLES.CLIENT]: CLIENT_PERMISSIONS,
};

export function getPermissionsForRole(role: Role): Permission[] {
  return [...ROLE_PERMISSIONS[role]];
}

export function roleHasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
