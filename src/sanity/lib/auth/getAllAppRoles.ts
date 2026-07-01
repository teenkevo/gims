import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";
import type { Permission } from "@/lib/auth/permissions";

export type AppRoleRecord = {
  _id: string;
  name: string;
  slug: { current: string };
  permissions: Permission[];
  isSystem?: boolean;
  archived?: boolean;
  inUse: boolean;
  createdBy?: string;
  modifiedBy?: string;
  _createdAt: string;
  _updatedAt: string;
};

const ALL_APP_ROLES_QUERY = defineQuery(`
  *[_type == "appRole"] | order(name asc) {
    _id,
    name,
    slug,
    permissions,
    isSystem,
    archived,
    createdBy,
    modifiedBy,
    _createdAt,
    _updatedAt,
    "inUse": count(*[_type == "department" && references(^._id)]) > 0
  }
`);

export async function getAllAppRoles(): Promise<AppRoleRecord[]> {
  try {
    const roles = await sanityFetch({
      query: ALL_APP_ROLES_QUERY,
      revalidate: 0,
    });
    return roles ?? [];
  } catch (error) {
    console.error("Error fetching app roles", error);
    return [];
  }
}
