import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";

export const getStandardById = async (standardId: string) => {
  const STANDARD_BY_ID_QUERY = defineQuery(`
        *[_type == "standard" && _id == $standardId] {
            _id, 
            name,
            acronym,
            description
        }
  `);

  try {
    const standard = await sanityFetch({
      query: STANDARD_BY_ID_QUERY,
      params: { standardId },
      tags: [`standard-${standardId}`],
    });

    // return data or empty array if no data is found
    return standard || [];
  } catch (error) {
    console.error("Error fetching standard by id", error);
    return [];
  }
};
