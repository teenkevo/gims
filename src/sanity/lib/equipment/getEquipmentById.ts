import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";

export const getEquipmentById = async (equipmentId: string) => {
  const EQUIPMENT_BY_ID_QUERY = defineQuery(`
    *[_type == "equipment" && _id == $equipmentId] {
      _id,
      internalId,
      name,
      serialNumber,
      category,
      manufacturer,
      model,
      status,
      notes,
      lastMaintenance,
      nextMaintenance,
      userManuals,
      assignedPersonnel[]->{
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
      supplier {
        name,
        contactPerson,
        contactEmail,
        contactPhone
      },
      maintenanceCompany {
        companyName,
        contactPerson,
        contactEmail,
        contactPhone
      },
      "labs": *[_type == "lab" && references(^._id)] {
        _id,
        internalId,
        name,
        labSection,
        status
      },
      "maintenanceLogs": *[_type == "maintenanceLog" && references(^._id)] | order(date desc) {
        _id,
        date,
        maintenanceType,
        maintenanceNotes,
        supervisedBy->{ _id, fullName, internalId },
        maintenanceCompany { companyName }
      }
    }
  `);

  try {
    const equipment = await sanityFetch({
      query: EQUIPMENT_BY_ID_QUERY,
      params: { equipmentId },
      tags: ["equipment"],
      revalidate: 0,
    });

    return equipment || [];
  } catch (error) {
    console.error("Error fetching equipment by id", error);
    return [];
  }
};
