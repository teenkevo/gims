import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";

export const getLabById = async (labId: string) => {
  const LAB_BY_ID_QUERY = defineQuery(`
    *[_type == "lab" && _id == $labId] {
      _id,
      internalId,
      name,
      description,
      labSection,
      status,
      location,
      capacity,
      notes,
      accreditation {
        standard,
        certificateNumber,
        accreditingBody,
        expiryDate
      },
      personnel[]->{
        _id,
        internalId,
        fullName,
        email,
        phone,
        departmentRoles[] {
          department->{ department },
          role
        }
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
        status,
        lastMaintenance,
        nextMaintenance
      },
      "projects": projects[]->{
        _id,
        name,
        internalId,
        endDate,
        startDate
      },
      testCapabilities[]->{
        _id,
        code,
        testParameter,
        status,
        testMethods[]->{
          _id,
          code,
          description,
          standard->{ name, acronym }
        }
      },
      sopDocuments[] {
        _key,
        category,
        documentUrl,
        description
      }
    }
  `);

  try {
    const labs = await sanityFetch({
      query: LAB_BY_ID_QUERY,
      params: { labId },
      tags: ["labs"],
      revalidate: 0,
    });

    return labs || [];
  } catch (error) {
    console.error("Error fetching lab by id", error);
    return [];
  }
};
