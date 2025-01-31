import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";

export const getAllProjects = async () => {
  const ALL_PROJECTS_QUERY = defineQuery(`
        *[_type == "project"] {
          _id,
          name,
          client, 
          startDate, 
          endDate, 
          stagesCompleted, 
          client->{
            _id, 
            name, 
            email, 
            phone
          }
        }
  `);

  try {
    const projects = await sanityFetch({
      query: ALL_PROJECTS_QUERY,
    });

    // return data or empty array if no data is found
    return projects.data || [];
  } catch (error) {
    console.error("Error fetching all projects", error);
    return [];
  }
};
