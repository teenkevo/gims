import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";

export const getSampleReviewTemplates = async () => {
  const SAMPLE_REVIEW_TEMPLATES_QUERY = defineQuery(`
        *[_type == "sampleReviewTemplate" && isActive == true]  {
          _id,
          name,
          version,
          description,
          isActive,
          reviewItems[] {
            id,
            label,
            category,
            required,
          }
        }
  `);

  try {
    const sampleReviewTemplates = await sanityFetch({
      query: SAMPLE_REVIEW_TEMPLATES_QUERY,
      revalidate: 0,
    });

    // return data or empty array if no data is found
    return sampleReviewTemplates || [];
  } catch (error) {
    console.error("Error fetching sample review templates", error);
    return [];
  }
};
