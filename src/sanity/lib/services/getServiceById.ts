import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";

export const getServiceById = async (serviceId: string) => {
  const SERVICE_BY_ID_QUERY = defineQuery(`
        *[_type == "service" && _id == $serviceId] {
            _id, 
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
                },
                documents[] {
                  _key,
                  asset->{
                    url,
                    originalFilename,
                    size,
                    mimeType,
                  }
                }  
            },
            sampleClass -> {
                _id,
                name,
                description
            },
            status
        }
  `);

  try {
    const service = await sanityFetch({
      query: SERVICE_BY_ID_QUERY,
      params: { serviceId },
      revalidate: 0,
    });

    // return data or empty array if no data is found
    return service || [];
  } catch (error) {
    console.error("Error fetching service by id", error);
    return [];
  }
};
