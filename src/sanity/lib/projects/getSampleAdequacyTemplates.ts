import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";

export const getSampleAdequacyTemplates = async () => {
  const SAMPLE_ADEQUACY_TEMPLATES_QUERY = defineQuery(`
        *[_type == "sampleAdequacyTemplate" && isActive == true]  {
          _id,
          name,
          version,
          description,
          isActive,
          adequacyChecks[] {
            id,
            label,
            required,
            category,
          }
        }
  `);

  try {
    const sampleAdequacyTemplates = await sanityFetch({
      query: SAMPLE_ADEQUACY_TEMPLATES_QUERY,
      revalidate: 0,
    });

    // return data or empty array if no data is found
    return sampleAdequacyTemplates || [];
  } catch (error) {
    console.error("Error fetching all projects", error);
    return [];
  }
};
