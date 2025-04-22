import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";

export const getAllTestMethods = async () => {
  const ALL_TEST_METHODS_QUERY = defineQuery(`
        *[_type == "testMethod"] {
            _id, 
            code,
            description,
            standard -> {
                _id,
                name,
                acronym
            },
            documents[] {
              _key,
              asset->{
                _id,
                url,
                originalFilename,
                size,
                mimeType,
              },
              name
            }
        }
  `);

  try {
    const testMethods = await sanityFetch({
      query: ALL_TEST_METHODS_QUERY,
      revalidate: 0,
    });

    // return data or empty array if no data is found
    return testMethods || [];
  } catch (error) {
    console.error("Error fetching all test methods", error);
    return [];
  }
};
