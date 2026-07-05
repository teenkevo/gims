"use server";

import { getAuditLogs } from "@/sanity/lib/auth/getAuditLogs";
import { getAllAppRoles } from "@/sanity/lib/auth/getAllAppRoles";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/session";
import { getPersonnelAccessOverview } from "@/lib/auth/security-data";
import { getPersonnelByEmail } from "@/sanity/lib/personnel/getPersonnelByEmail";
import { getSecurityDepartments } from "@/sanity/lib/departments/getSecurityDepartments";
import { getAllDepartments } from "@/sanity/lib/departments/getAllDepartments";
import {
  getAdministrationDepartmentRoles,
  getDepartmentDetail,
  getDepartmentEditorData,
  getPersonnelPickerOptions,
} from "@/sanity/lib/departments/getDepartmentDetail";

export async function fetchSecurityRoles() {
  await requirePermission(PERMISSIONS["security:read"]);
  return getAllAppRoles();
}

export async function fetchSecurityUsers() {
  await requirePermission(PERMISSIONS["security:read"]);
  return getPersonnelAccessOverview();
}

export type SecurityUserFilterOption = {
  name: string;
  roles: string[];
};

export async function fetchSecurityUserFilterOptions(): Promise<
  SecurityUserFilterOption[]
> {
  await requirePermission(PERMISSIONS["security:read"]);
  const departments = await getAllDepartments();

  return departments
    .filter((department) => department.department)
    .map((department) => ({
      name: department.department as string,
      roles: (department.roles ?? [])
        .map((role) => role?.roleName)
        .filter((roleName): roleName is string => Boolean(roleName))
        .sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchSecurityAuditLogs() {
  await requirePermission(PERMISSIONS["security:read"]);
  return getAuditLogs(100);
}

export async function fetchSecurityDepartments() {
  await requirePermission(PERMISSIONS["security:read"]);
  return getSecurityDepartments();
}

export async function fetchDepartmentDetail(departmentId: string) {
  await requirePermission(PERMISSIONS["security:read"]);
  return getDepartmentDetail(departmentId);
}

export async function fetchDepartmentEditorData(departmentId: string) {
  await requirePermission(PERMISSIONS["security:read"]);
  return getDepartmentEditorData(departmentId);
}

export async function fetchPersonnelPickerOptions(departmentId?: string) {
  await requirePermission(PERMISSIONS["security:read"]);
  return getPersonnelPickerOptions(departmentId);
}

export async function checkPersonnelEmailExists(email: string) {
  await requirePermission(PERMISSIONS["security:read"]);
  if (!email.trim()) {
    return null;
  }
  return getPersonnelByEmail(email.trim());
}

export async function fetchAdministrationDepartmentRoles() {
  await requirePermission(PERMISSIONS["security:read"]);
  return getAdministrationDepartmentRoles();
}
