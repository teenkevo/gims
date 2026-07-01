import "server-only";

import type { Permission } from "./permissions";
import { PERMISSIONS, getPermissionsForRole } from "./permissions";
import { ROLES, type Role } from "./roles";
import { USER_TYPES, type UserType } from "./user-type";
import {
  formatDepartmentRoleLabel,
  type DepartmentRoleAssignment,
} from "./department-role-permissions";
import { resolvePermissionsFromPersonnel } from "./resolve-personnel-permissions";
import { getPersonnelByEmail } from "@/sanity/lib/personnel/getPersonnelByEmail";
import { getContactPersonByEmail } from "@/sanity/lib/clients/getContactPersonByEmail";
import type { AuthUser } from "./types";

export type ResolvedAccess = {
  userType: UserType;
  role: Role;
  permissions: Permission[];
  accessLabel: string;
  personnelId?: string;
  contactPersonId?: string;
  clientId?: string;
  departmentRoles: DepartmentRoleAssignment[];
};

const SUPER_ADMIN_EMAILS = (process.env.SUPER_ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function deriveCompatRole(permissions: Permission[], userType: UserType): Role {
  if (userType === USER_TYPES.SUPER_ADMIN) return ROLES.SUPER_ADMIN;
  if (userType === USER_TYPES.CLIENT) return ROLES.CLIENT;
  if (userType === USER_TYPES.PENDING) return ROLES.VIEWER;

  if (permissions.includes(PERMISSIONS["security:manage"])) {
    return ROLES.SUPER_ADMIN;
  }

  const hasWrite = permissions.some(
    (p) =>
      p.endsWith(":create") ||
      p.endsWith(":update") ||
      p.endsWith(":delete") ||
      p === PERMISSIONS["billing:manage"]
  );

  if (
    permissions.includes(PERMISSIONS["personnel:create"]) ||
    permissions.includes(PERMISSIONS["billing:manage"])
  ) {
    return ROLES.ADMIN;
  }

  return hasWrite ? ROLES.EDITOR : ROLES.VIEWER;
}

function buildUserFromPersonnel(
  clerkUserId: string,
  personnel: NonNullable<Awaited<ReturnType<typeof getPersonnelByEmail>>>
): AuthUser {
  const nameParts = personnel.fullName.trim().split(/\s+/);
  const firstName = nameParts[0] ?? null;
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : null;

  return {
    id: clerkUserId,
    email: personnel.email,
    firstName,
    lastName,
    fullName: personnel.fullName,
    imageUrl: null,
  };
}

function buildUserFromContact(
  clerkUserId: string,
  contact: NonNullable<Awaited<ReturnType<typeof getContactPersonByEmail>>>
): AuthUser {
  const nameParts = contact.name.trim().split(/\s+/);
  const firstName = nameParts[0] ?? null;
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : null;

  return {
    id: clerkUserId,
    email: contact.email,
    firstName,
    lastName,
    fullName: contact.name,
    imageUrl: null,
  };
}

export async function resolveAccess(
  clerkUserId: string,
  email: string,
  clerkMetadata?: Record<string, unknown>
): Promise<ResolvedAccess & { user: AuthUser }> {
  const normalizedEmail = email.toLowerCase();

  if (
    clerkMetadata?.userType === USER_TYPES.SUPER_ADMIN ||
    SUPER_ADMIN_EMAILS.includes(normalizedEmail)
  ) {
    const permissions = getPermissionsForRole(ROLES.SUPER_ADMIN);
    return {
      userType: USER_TYPES.SUPER_ADMIN,
      role: ROLES.SUPER_ADMIN,
      permissions,
      accessLabel: "Super Admin",
      departmentRoles: [],
      user: {
        id: clerkUserId,
        email,
        firstName: null,
        lastName: null,
        fullName: email,
        imageUrl: null,
      },
    };
  }

  const personnel = await getPersonnelByEmail(email);

  if (personnel) {
    if (personnel.status === "terminated" || personnel.status === "resigned") {
      return {
        userType: USER_TYPES.PENDING,
        role: ROLES.VIEWER,
        permissions: [],
        accessLabel: "Access revoked",
        personnelId: personnel._id,
        departmentRoles: [],
        user: buildUserFromPersonnel(clerkUserId, personnel),
      };
    }

    const { permissions, assignments: departmentRoles, usedAppRoles } =
      resolvePermissionsFromPersonnel(personnel.departmentRoles);

    const accessLabel =
      usedAppRoles.length > 0
        ? usedAppRoles.join(", ")
        : departmentRoles.length > 0
          ? departmentRoles
              .map((r) =>
                formatDepartmentRoleLabel(r.departmentName, r.roleName)
              )
              .join(", ")
          : "Personnel (no departmental role)";

    return {
      userType: USER_TYPES.INTERNAL,
      role: deriveCompatRole(permissions, USER_TYPES.INTERNAL),
      permissions,
      accessLabel,
      personnelId: personnel._id,
      departmentRoles,
      user: buildUserFromPersonnel(clerkUserId, personnel),
    };
  }

  const contact = await getContactPersonByEmail(email);

  if (contact) {
    const permissions = getPermissionsForRole(ROLES.CLIENT);
    return {
      userType: USER_TYPES.CLIENT,
      role: ROLES.CLIENT,
      permissions,
      accessLabel: contact.client?.name
        ? `Client · ${contact.client.name}`
        : "Client contact",
      contactPersonId: contact._id,
      clientId: contact.client?._id,
      departmentRoles: [],
      user: buildUserFromContact(clerkUserId, contact),
    };
  }

  return {
    userType: USER_TYPES.PENDING,
    role: ROLES.VIEWER,
    permissions: [],
    accessLabel: "Pending HR approval",
    departmentRoles: [],
    user: {
      id: clerkUserId,
      email,
      firstName: null,
      lastName: null,
      fullName: email,
      imageUrl: null,
    },
  };
}
