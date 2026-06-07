import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";

export const getAllLabs = async () => {
  const ALL_LABS_QUERY = defineQuery(`
    *[_type == "lab"] | order(internalId desc) {
      _id,
      internalId,
      name,
      labSection,
      status,
      location,
      capacity,
      personnel[]->{
        _id,
        internalId,
        fullName
      },
      labHead->{
        _id,
        internalId,
        fullName
      },
      equipment[]->{
        _id,
        name,
        serialNumber,
        status
      },
      "projects": projects[]->{
        _id,
        name,
        internalId,
        endDate
      },
      testCapabilities[]->{
        _id,
        code,
        testParameter
      }
    }
  `);

  try {
    const labs = await sanityFetch({
      query: ALL_LABS_QUERY,
      tags: ["labs"],
      revalidate: 0,
    });

    return labs || [];
  } catch (error) {
    console.error("Error fetching all labs", error);
    return [];
  }
};
