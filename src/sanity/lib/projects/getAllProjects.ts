import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";

export const getAllProjects = async () => {
  const ALL_PROJECTS_QUERY = defineQuery(`
        *[_type == "project"] | order(internalId desc) {
          _id,
          internalId,
          name,
          startDate, 
          endDate, 
          stagesCompleted, 
          clients[]->{
            _id, 
            name,
            internalId
          },
          quotation->{
            _id,
            revisionNumber,
            currency,
            status,
            rejectionNotes,
            revisions[]->|order(revisionNumber desc){
              _id,
              revisionNumber,
              currency,
              status,
              rejectionNotes,
              items[] {
                lineTotal,
              },
              otherItems[] {
                lineTotal,
              },
              vatPercentage,
            },
            items[] {
              lineTotal,
            },
            otherItems[] {
              lineTotal,
            },
            vatPercentage,
          }
        }
  `);

  try {
    const projects = await sanityFetch({
      query: ALL_PROJECTS_QUERY,
      revalidate: 0,
    });

    // return data or empty array if no data is found
    return projects || [];
  } catch (error) {
    console.error("Error fetching all projects", error);
    return [];
  }
};
