import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";

export const getAllEquipment = async () => {
  const ALL_EQUIPMENT_QUERY = defineQuery(`
    *[_type == "equipment"] | order(internalId desc) {
      _id,
      internalId,
      name,
      serialNumber,
      category,
      manufacturer,
      model,
      status,
      lastMaintenance,
      nextMaintenance,
      assignedPersonnel[]->{
        _id,
        internalId,
        fullName
      },
      "labs": *[_type == "lab" && references(^._id)] {
        _id,
        internalId,
        name
      }
    }
  `);

  try {
    const equipment = await sanityFetch({
      query: ALL_EQUIPMENT_QUERY,
      tags: ["equipment"],
      revalidate: 0,
    });

    return equipment || [];
  } catch (error) {
    console.error("Error fetching all equipment", error);
    return [];
  }
};
