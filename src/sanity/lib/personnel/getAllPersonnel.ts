import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";

export const getAllPersonnel = async () => {
  const ALL_PERSONNEL_QUERY = defineQuery(`
        *[_type == "personnel"] | order(internalId desc) {
          _id,
          internalId,
          fullName,
          email,
          phone,
          departmentRoles[] {
            department->{
              _id,
              department
            },
            role
          },
          projects[]->{
            _id,
            name,
            internalId
          },
          status
        }
  `);

  try {
    const personnel = await sanityFetch({
      query: ALL_PERSONNEL_QUERY,
      revalidate: 0,
    });

    // return data or empty array if no data is found
    return personnel || [];
  } catch (error) {
    console.error("Error fetching all personnel", error);
    return [];
  }
};
