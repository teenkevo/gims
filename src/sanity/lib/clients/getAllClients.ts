import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";

export const getAllClients = async () => {
  const ALL_CLIENTS_QUERY = defineQuery(`
        *[_type == "client"] {
            _id, 
            name, 
            email, 
            phoneNumber
        }
  `);

  try {
    const clients = await sanityFetch({
      query: ALL_CLIENTS_QUERY,
    });

    // return data or empty array if no data is found
    return clients.data || [];
  } catch (error) {
    console.error("Error fetching all projects", error);
    return [];
  }
};
