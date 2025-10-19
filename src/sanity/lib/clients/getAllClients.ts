import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";

export const getAllClients = async () => {
  const ALL_CLIENTS_QUERY = defineQuery(`
    *[_type == "client"] {
      _id,
      name,
      internalId,
      // Reverse‐lookup: find projects that reference this client
      "projects": *[
        _type == "project" 
        && references(^._id)
      ] {
        _id,
        name,
        internalId,
        endDate,
        contactPersons[]->{
          _id,
          name,
          email,
          phone,
          designation,
        }
      }
    }
  `);

  try {
    const clients = await sanityFetch({
      query: ALL_CLIENTS_QUERY,
      revalidate: 0,
    });

    // return data or empty array if no data is found
    return clients || [];
  } catch (error) {
    console.error("Error fetching all projects", error);
    return [];
  }
};
