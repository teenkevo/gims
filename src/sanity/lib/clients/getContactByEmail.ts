import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";

export const checkContactEmailExists = async (
  email: string,
  clientId: string
) => {
  const CONTACT_BY_EMAIL_AND_CLIENT_QUERY = defineQuery(`
    *[_type == "contactPerson" && email == $email && client._ref == $clientId] {
      _id,
      name,
      email,
      client->{
        _id,
        name
      }
    }
  `);

  try {
    const contacts = await sanityFetch({
      query: CONTACT_BY_EMAIL_AND_CLIENT_QUERY,
      params: { email, clientId },
      tags: ["contactPerson"],
    });

    // return the first contact if found, or null if not found
    return contacts[0] || null;
  } catch (error) {
    console.error("Error checking contact email", error);
    return null;
  }
};
