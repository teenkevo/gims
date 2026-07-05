import { cache } from "react";
import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";

export type AppUserRecord = {
  _id: string;
  clerkUserId?: string;
  email: string;
  userType: string;
  isActive: boolean;
  permissions?: string[];
  contactPerson?: {
    _id: string;
    name: string;
    email: string;
    designation?: string;
    appAccessStatus?: string;
    clerkUserId?: string;
    portalPermissions?: string[];
    client?: {
      _id: string;
      name: string;
    } | null;
  } | null;
  client?: {
    _id: string;
    name: string;
  } | null;
};

const APP_USER_BY_EMAIL_QUERY = defineQuery(`
  *[_type == "appUser" && lower(email) == lower($email)][0] {
    _id,
    clerkUserId,
    email,
    userType,
    isActive,
    permissions,
    contactPerson->{
      _id,
      name,
      email,
      designation,
      appAccessStatus,
      clerkUserId,
      portalPermissions,
      client->{
        _id,
        name
      }
    },
    client->{
      _id,
      name
    }
  }
`);

export const getAppUserByEmail = cache(
  async (email: string): Promise<AppUserRecord | null> => {
    if (!email) return null;

    try {
      const appUser = await sanityFetch({
        query: APP_USER_BY_EMAIL_QUERY,
        params: { email },
        revalidate: 0,
      });
      return appUser ?? null;
    } catch (error) {
      console.error("Error fetching app user by email", error);
      return null;
    }
  }
);
