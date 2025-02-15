import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";

export const getProjectById = async (projectId: string) => {
  const PROJECT_BY_ID_QUERY = defineQuery(`
        *[_type == "project" && _id == $projectId] {
          _id,
          name, 
          startDate, 
          endDate, 
          stagesCompleted, 
          contactPersons[]->{
            _id,
            name,
            email,
            phone,
            designation,
            clients[]->{
              _id,
            },
          },
          clients[]->{
            _id, 
            name,
          }
        }
  `);

  try {
    const project = await sanityFetch({
      query: PROJECT_BY_ID_QUERY,
      params: { projectId },
      tags: [`project-${projectId}`],
    });

    // return data or empty array if no data is found
    return project || [];
  } catch (error) {
    console.error("Error fetching project by id", error);
    return [];
  }
};
