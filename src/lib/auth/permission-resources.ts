import { PERMISSIONS, type Permission } from "./permissions";

export type CrudAction = "create" | "read" | "update" | "delete";

export type ExtraAction = {
  action: string;
  label: string;
};

export type PermissionResource = {
  key: string;
  label: string;
  actions: CrudAction[];
  extraActions?: ExtraAction[];
};

/** GIMS modules shown as rows in the permission matrix. */
export const PERMISSION_RESOURCES: PermissionResource[] = [
  {
    key: "projects",
    label: "Projects",
    actions: ["create", "read", "update", "delete"],
  },
  {
    key: "clients",
    label: "Clients",
    actions: ["create", "read", "update", "delete"],
  },
  {
    key: "services",
    label: "Services",
    actions: ["create", "read", "update", "delete"],
  },
  {
    key: "labs",
    label: "Laboratories",
    actions: ["create", "read", "update", "delete"],
  },
  {
    key: "equipment",
    label: "Equipment",
    actions: ["create", "read", "update", "delete"],
  },
  {
    key: "personnel",
    label: "Personnel",
    actions: ["create", "read", "update", "delete"],
  },
  {
    key: "rfi",
    label: "Requests for Information",
    actions: ["create", "read", "update", "delete"],
  },
  {
    key: "billing",
    label: "Billing",
    actions: ["create", "read", "update", "delete"],
    extraActions: [
      { action: "manage", label: "Manage" },
      { action: "respond", label: "Respond to" },
      { action: "pay", label: "Pay" },
    ],
  },
  {
    key: "security",
    label: "Security",
    actions: ["read"],
    extraActions: [{ action: "manage", label: "Manage" }],
  },
];

export function toPermissionKey(
  resourceKey: string,
  action: string
): Permission | null {
  const key = `${resourceKey}:${action}` as Permission;
  return Object.values(PERMISSIONS).includes(key) ? key : null;
}

export function isPermissionEnabled(
  permissions: Permission[],
  resourceKey: string,
  action: string
): boolean {
  const key = toPermissionKey(resourceKey, action);
  return key ? permissions.includes(key) : false;
}

export function togglePermission(
  permissions: Permission[],
  resourceKey: string,
  action: string,
  enabled: boolean
): Permission[] {
  const key = toPermissionKey(resourceKey, action);
  if (!key) return permissions;

  if (enabled) {
    return permissions.includes(key) ? permissions : [...permissions, key];
  }

  return permissions.filter((p) => p !== key);
}

export function permissionsToMatrixSummary(permissions: Permission[]): string {
  const count = permissions.length;
  return count === 0 ? "No permissions" : `${count} permission${count === 1 ? "" : "s"}`;
}
