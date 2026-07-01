import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";

export type SecurityDepartmentRecord = {
  _id: string;
  department: string;
  createdBy?: string;
  modifiedBy?: string;
  _createdAt: string;
  roleCount: number;
  personnelCount: number;
};

const SECURITY_DEPARTMENTS_QUERY = defineQuery(`
  *[_type == "department"] | order(department asc) {
    _id,
    department,
    createdBy,
    modifiedBy,
    _createdAt,
    "roleCount": count(roles),
    "personnelCount": count(*[_type == "personnel" && references(^._id)])
  }
`);

export async function getSecurityDepartments(): Promise<SecurityDepartmentRecord[]> {
  try {
    const departments = await sanityFetch({
      query: SECURITY_DEPARTMENTS_QUERY,
      revalidate: 0,
    });
    return departments ?? [];
  } catch (error) {
    console.error("Error fetching security departments", error);
    return [];
  }
}
