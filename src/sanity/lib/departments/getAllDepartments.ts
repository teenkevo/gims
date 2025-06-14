import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";

export const getAllDepartments = async () => {
  const ALL_DEPARTMENTS_QUERY = defineQuery(`
        *[_type == "department"] {
          _id,
          department,
          roles
        }
  `);

  try {
    const departments = await sanityFetch({
      query: ALL_DEPARTMENTS_QUERY,
      revalidate: 0,
    });

    // return data or empty array if no data is found
    return departments || [];
  } catch (error) {
    console.error("Error fetching all departments", error);
    return [];
  }
};
