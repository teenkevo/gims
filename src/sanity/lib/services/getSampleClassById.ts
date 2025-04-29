import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";

export const getSampleClassById = async (sampleClassId: string) => {
  const SAMPLE_CLASS_BY_ID_QUERY = defineQuery(`
        *[_type == "sampleClass" && _id == $sampleClassId] {
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
    const sampleClass = await sanityFetch({
      query: SAMPLE_CLASS_BY_ID_QUERY,
      params: { sampleClassId },
      tags: [`sampleClass-${sampleClassId}`],
    });

    // return data or empty array if no data is found
    return sampleClass || [];
  } catch (error) {
    console.error("Error fetching sample class by id", error);
    return [];
  }
};
