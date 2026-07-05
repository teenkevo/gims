import { CLIENT_PERMISSIONS, PERMISSIONS, type Permission } from "./permissions";

/** Default portal permissions for client contacts. */
export const DEFAULT_CLIENT_PORTAL_PERMISSIONS: Permission[] = [
  ...CLIENT_PERMISSIONS,
];

export function isValidPermission(value: string): value is Permission {
  return Object.values(PERMISSIONS).includes(value as Permission);
}

export function resolveClientPortalPermissions(
  ...sources: (readonly string[] | null | undefined)[]
): Permission[] {
  for (const source of sources) {
    if (!source?.length) continue;

    const resolved = source.filter(isValidPermission);
    if (resolved.length > 0) {
      return [...new Set(resolved)];
    }
  }

  return [...DEFAULT_CLIENT_PORTAL_PERMISSIONS];
}
