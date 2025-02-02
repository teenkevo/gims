import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";

export const getProjectById = async (projectId: string) => {
  const PROJECT_BY_ID_QUERY = defineQuery(`
        *[_type == "project" && _id == $projectId] {
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
            phoneNumber
          }
        }
  `);

  try {
    const project = await sanityFetch({
      query: PROJECT_BY_ID_QUERY,
      params: { projectId },
    });

    // return data or empty array if no data is found
    return project.data || [];
  } catch (error) {
    console.error("Error fetching project by id", error);
    return [];
  }
};
