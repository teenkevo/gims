export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  EDITOR: "editor",
  VIEWER: "viewer",
  CLIENT: "client",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.ADMIN]: "Admin",
  [ROLES.EDITOR]: "Editor",
  [ROLES.VIEWER]: "Viewer",
  [ROLES.CLIENT]: "Client",
};

export const ALL_ROLES = Object.values(ROLES);

export const INTERNAL_ROLES: Role[] = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.EDITOR,
  ROLES.VIEWER,
];

export const DEFAULT_ROLE: Role = ROLES.VIEWER;

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && ALL_ROLES.includes(value as Role);
}

export function parseRole(value: unknown): Role {
  return isRole(value) ? value : DEFAULT_ROLE;
}
