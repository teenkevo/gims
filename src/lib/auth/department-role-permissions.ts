import { PERMISSIONS, type Permission } from "./permissions";

const READ = {
  projects: PERMISSIONS["projects:read"],
  clients: PERMISSIONS["clients:read"],
  services: PERMISSIONS["services:read"],
  labs: PERMISSIONS["labs:read"],
  equipment: PERMISSIONS["equipment:read"],
  personnel: PERMISSIONS["personnel:read"],
  rfi: PERMISSIONS["rfi:read"],
  billing: PERMISSIONS["billing:read"],
  security: PERMISSIONS["security:read"],
} as const;

const LAB_READ: Permission[] = [
  READ.projects,
  READ.labs,
  READ.equipment,
  READ.services,
  READ.rfi,
];

const LAB_WRITE: Permission[] = [
  ...LAB_READ,
  PERMISSIONS["projects:update"],
  PERMISSIONS["equipment:update"],
  PERMISSIONS["labs:update"],
  PERMISSIONS["rfi:create"],
  PERMISSIONS["rfi:update"],
];

const OFFICE_READ: Permission[] = [
  READ.projects,
  READ.clients,
  READ.services,
  READ.billing,
  READ.rfi,
];

const OFFICE_WRITE: Permission[] = [
  ...OFFICE_READ,
  PERMISSIONS["projects:create"],
  PERMISSIONS["projects:update"],
  PERMISSIONS["clients:create"],
  PERMISSIONS["clients:update"],
  PERMISSIONS["billing:create"],
  PERMISSIONS["billing:update"],
  PERMISSIONS["rfi:create"],
  PERMISSIONS["rfi:update"],
];

const HR_PERMISSIONS: Permission[] = [
  ...OFFICE_READ,
  PERMISSIONS["personnel:create"],
  PERMISSIONS["personnel:update"],
  PERMISSIONS["personnel:delete"],
  READ.personnel,
  READ.security,
];

const MANAGEMENT_PERMISSIONS: Permission[] = [
  ...OFFICE_WRITE,
  PERMISSIONS["personnel:read"],
  PERMISSIONS["labs:create"],
  PERMISSIONS["labs:update"],
  PERMISSIONS["equipment:create"],
  PERMISSIONS["equipment:update"],
  PERMISSIONS["services:update"],
  READ.security,
];

/** Default when a departmental role has no explicit mapping. */
export const DEFAULT_DEPARTMENT_ROLE_PERMISSIONS: Permission[] = [
  READ.projects,
  READ.services,
];

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function matrixKey(departmentName: string, roleName: string): string {
  return `${normalize(departmentName)}::${normalize(roleName)}`;
}

/**
 * Department + job title → permissions.
 * Keys are normalized `department::role`. Use `*::role` for any department.
 */
export const DEPARTMENT_ROLE_PERMISSIONS: Record<string, Permission[]> = {
  // Laboratories
  [matrixKey("Laboratories", "Lab Technician")]: LAB_READ,
  [matrixKey("Laboratories", "Lab Technicians")]: LAB_READ,
  [matrixKey("Laboratories", "Lab Engineer")]: LAB_WRITE,
  [matrixKey("Laboratories", "Senior Lab Engineer")]: [
    ...LAB_WRITE,
    PERMISSIONS["projects:create"],
  ],
  [matrixKey("Laboratories", "Technical Manager")]: MANAGEMENT_PERMISSIONS,
  [matrixKey("Laboratories", "Lab Manager")]: MANAGEMENT_PERMISSIONS,

  // Wildcards by title across departments
  [`*::${normalize("Department Head")}`]: MANAGEMENT_PERMISSIONS,
  [`*::${normalize("Manager")}`]: MANAGEMENT_PERMISSIONS,

  // HR
  [matrixKey("Human Resources", "HR Officer")]: HR_PERMISSIONS,
  [matrixKey("HR", "HR Officer")]: HR_PERMISSIONS,
  [matrixKey("Human Resources", "Personnel Officer")]: HR_PERMISSIONS,

  // Finance / billing
  [matrixKey("Finance", "Billing Officer")]: [
    ...OFFICE_READ,
    PERMISSIONS["billing:create"],
    PERMISSIONS["billing:update"],
    PERMISSIONS["billing:manage"],
  ],
  [matrixKey("Finance", "Accounts Officer")]: [
    ...OFFICE_READ,
    PERMISSIONS["billing:update"],
  ],

  // General administration
  [matrixKey("Administration", "Administrator")]: MANAGEMENT_PERMISSIONS,
  [matrixKey("Administration", "Admin")]: MANAGEMENT_PERMISSIONS,
};

export type DepartmentRoleAssignment = {
  departmentName: string;
  roleName: string;
};

export function getPermissionsForDepartmentRole(
  departmentName: string,
  roleName: string
): Permission[] {
  const exact =
    DEPARTMENT_ROLE_PERMISSIONS[matrixKey(departmentName, roleName)];
  if (exact) return [...exact];

  const wildcard = DEPARTMENT_ROLE_PERMISSIONS[`*::${normalize(roleName)}`];
  if (wildcard) return [...wildcard];

  return [...DEFAULT_DEPARTMENT_ROLE_PERMISSIONS];
}

export function unionPermissions(
  assignments: DepartmentRoleAssignment[]
): Permission[] {
  const set = new Set<Permission>();

  for (const { departmentName, roleName } of assignments) {
    for (const permission of getPermissionsForDepartmentRole(
      departmentName,
      roleName
    )) {
      set.add(permission);
    }
  }

  return [...set];
}

export function formatDepartmentRoleLabel(
  departmentName: string,
  roleName: string
): string {
  return `${departmentName} · ${roleName}`;
}
