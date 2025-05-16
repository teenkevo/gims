import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";

export const getAllContacts = async () => {
  const ALL_CONTACTS_QUERY = defineQuery(`
        *[_type == "contactPerson"] {
            _id, 
            name,
            email,
            designation,
            phone,
            clients[]->{
              _id,
            },

        }
  `);

  try {
    const contacts = await sanityFetch({
      query: ALL_CONTACTS_QUERY,
      tags: ["contacts"],
    });

    // return data or empty array if no data is found
    return contacts.data || [];
  } catch (error) {
    console.error("Error fetching all contacts", error);
    return [];
  }
};
