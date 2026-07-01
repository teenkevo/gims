import { cache } from "react";
import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";

export type PersonnelByEmail = {
  _id: string;
  fullName: string;
  email: string;
  status: string;
  clerkUserId?: string;
  appAccessStatus?: string;
  departmentRoles: {
    role: string;
    department: {
      _id: string;
      department: string;
    } | null;
  }[];
};

const PERSONNEL_BY_EMAIL_QUERY = defineQuery(`
  *[_type == "personnel" && lower(email) == lower($email)][0] {
    _id,
    fullName,
    email,
    status,
    clerkUserId,
    appAccessStatus,
    departmentRoles[] {
      role,
      department->{
        _id,
        department
      }
    }
  }
`);

export const getPersonnelByEmail = cache(
  async (email: string): Promise<PersonnelByEmail | null> => {
    if (!email) return null;

    try {
      const personnel = await sanityFetch({
        query: PERSONNEL_BY_EMAIL_QUERY,
        params: { email },
        revalidate: 0,
      });
      return personnel ?? null;
    } catch (error) {
      console.error("Error fetching personnel by email", error);
      return null;
    }
  }
);
