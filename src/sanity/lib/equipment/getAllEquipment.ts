import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";

export const getAllEquipment = async () => {
  const ALL_EQUIPMENT_QUERY = defineQuery(`
    *[_type == "equipment"] | order(name asc) {
      _id,
      name,
      serialNumber,
      status
    }
  `);

  try {
    const equipment = await sanityFetch({
      query: ALL_EQUIPMENT_QUERY,
      revalidate: 0,
    });

    return equipment || [];
  } catch (error) {
    console.error("Error fetching all equipment", error);
    return [];
  }
};
