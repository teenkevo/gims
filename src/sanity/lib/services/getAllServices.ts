import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";

export const getAllServices = async () => {
  const ALL_SERVICES_QUERY = defineQuery(`
        *[_type == "service"] {
            _id, 
            status,
            code,
            testParameter,
            testMethods[] -> {
                _id,
                code,
                description,
                standard -> {
                    _id,
                    name,
                    acronym
                }
            },
            sampleClass -> {
                _id,
                name,
                description
            },
            
        }
  `);

  try {
    const services = await sanityFetch({
      query: ALL_SERVICES_QUERY,
      revalidate: 0,
    });

    // return data or empty array if no data is found
    return services || [];
  } catch (error) {
    console.error("Error fetching all services", error);
    return [];
  }
};
