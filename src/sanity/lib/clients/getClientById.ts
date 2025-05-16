import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";

export const getClientById = async (clientId: string) => {
  const CLIENT_BY_ID_QUERY = defineQuery(`
        *[_type == "client" && _id == $clientId] {
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
                endDate
            },
            "contacts": *[_type == "contactPerson" && references(^._id)] {
                _id,
                name,
                email,
                designation,
                phone
            }
        }
  `);

  try {
    const client = await sanityFetch({
      query: CLIENT_BY_ID_QUERY,
      params: { clientId },
      tags: [`client-${clientId}`, "contactPerson"],
    });

    // return data or empty array if no data is found
    return client || [];
  } catch (error) {
    console.error("Error fetching client by id", error);
    return [];
  }
};
