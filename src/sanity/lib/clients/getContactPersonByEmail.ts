import { cache } from "react";
import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";

export type ContactPersonByEmail = {
  _id: string;
  name: string;
  email: string;
  designation: string;
  appAccessStatus?: string;
  clerkUserId?: string;
  portalPermissions?: string[];
  client: {
    _id: string;
    name: string;
  } | null;
};

const CONTACT_BY_EMAIL_QUERY = defineQuery(`
  *[_type == "contactPerson" && lower(email) == lower($email)][0] {
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
  }
`);

export const getContactPersonByEmail = cache(
  async (email: string): Promise<ContactPersonByEmail | null> => {
    if (!email) return null;

    try {
      const contact = await sanityFetch({
        query: CONTACT_BY_EMAIL_QUERY,
        params: { email },
        revalidate: 0,
      });
      return contact ?? null;
    } catch (error) {
      console.error("Error fetching contact by email", error);
      return null;
    }
  }
);
