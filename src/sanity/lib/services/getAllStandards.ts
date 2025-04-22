import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";

export const getAllStandards = async () => {
  const ALL_STANDARDS_QUERY = defineQuery(`
        *[_type == "standard"] {
            _id, 
            name,
            acronym,
            description
        }
  `);

  try {
    const standards = await sanityFetch({
      query: ALL_STANDARDS_QUERY,
      revalidate: 0,
    });

    // return data or empty array if no data is found
    return standards || [];
  } catch (error) {
    console.error("Error fetching all standards", error);
    return [];
  }
};
