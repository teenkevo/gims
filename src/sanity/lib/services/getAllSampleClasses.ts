import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";

export const getAllSampleClasses = async () => {
  const ALL_SAMPLE_CLASSES_QUERY = defineQuery(`
        *[_type == "sampleClass"] {
            _id, 
            name,
            description
        }
  `);

  try {
    const sampleClasses = await sanityFetch({
      query: ALL_SAMPLE_CLASSES_QUERY,
    });

    // return data or empty array if no data is found
    return sampleClasses.data || [];
  } catch (error) {
    console.error("Error fetching all sample classes", error);
    return [];
  }
};
