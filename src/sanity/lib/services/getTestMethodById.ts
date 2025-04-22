import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";

export const getTestMethodById = async (testMethodId: string) => {
  const TEST_METHOD_BY_ID_QUERY = defineQuery(`
        *[_type == "testMethod" && _id == $testMethodId] {
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
    const testMethod = await sanityFetch({
      query: TEST_METHOD_BY_ID_QUERY,
      params: { testMethodId },
      revalidate: 0,
    });

    // return data or empty array if no data is found
    return testMethod || [];
  } catch (error) {
    console.error("Error fetching test method by id", error);
    return [];
  }
};
