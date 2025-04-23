import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";

export const getAllSampleClasses = async () => {
  const ALL_SAMPLE_CLASSES_QUERY = defineQuery(`
        *[_type == "sampleClass"] {
            _id, 
            name,
            description,
            subclasses[] {
                name,
                key
            }
        }
  `);

  try {
    const sampleClasses = await sanityFetch({
      query: ALL_SAMPLE_CLASSES_QUERY,
      revalidate: 0,
    });

    // return data or empty array if no data is found
    return sampleClasses || [];
  } catch (error) {
    console.error("Error fetching all sample classes", error);
    return [];
  }
};
