import { PERMISSION_RESOURCES } from "./permission-resources";
import type { Permission } from "./permissions";

export const FORBIDDEN_ACTION_CODE = "FORBIDDEN";

export type ActionErrorResult = {
  status: "error";
  error: string;
  code: typeof FORBIDDEN_ACTION_CODE;
};

const CRUD_VERBS: Record<string, string> = {
  create: "Create",
  read: "View",
  update: "Update",
  delete: "Delete",
  manage: "Manage",
};

function singularizeResourceLabel(label: string): string {
  if (label.endsWith("ies")) {
    return `${label.slice(0, -3)}y`.toLowerCase();
  }

  if (label.endsWith("s")) {
    return label.slice(0, -1).toLowerCase();
  }

  return label.toLowerCase();
}

/** Human-readable label for a permission, e.g. `projects:create` → "Create project". */
export function getPermissionActionLabel(permission: Permission): string {
  const [resourceKey, action] = permission.split(":");
  const resource = PERMISSION_RESOURCES.find((item) => item.key === resourceKey);
  const resourceLabel = resource?.label ?? resourceKey;
  const extraAction = resource?.extraActions?.find(
    (item) => item.action === action
  );

  if (extraAction) {
    return `${extraAction.label} ${singularizeResourceLabel(resourceLabel)}`;
  }

  const verb = CRUD_VERBS[action] ?? action;
  return `${verb} ${singularizeResourceLabel(resourceLabel)}`;
}

export function unauthorizedActionMessage(permission: Permission): string {
  return `Unauthorized action: ${getPermissionActionLabel(permission)}`;
}

export function isForbiddenActionResult(
  result: { status?: string; code?: string } | null | undefined
): boolean {
  return (
    result?.status === "error" && result.code === FORBIDDEN_ACTION_CODE
  );
}

export function getActionErrorMessage(
  result: { error?: unknown } | null | undefined,
  fallback = "Something went wrong"
): string {
  if (typeof result?.error === "string" && result.error.length > 0) {
    return result.error;
  }

  return fallback;
}
