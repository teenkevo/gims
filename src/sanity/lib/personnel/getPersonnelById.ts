import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";

const PERSONNEL_BY_ID_QUERY = defineQuery(`
  *[_type == "personnel" && _id == $personnelId][0] {
    _id,
    internalId,
    fullName,
    email,
    phone,
    appAccessStatus,
    departmentRoles[] {
      role,
      department->{
        _id,
        department,
        roles[] {
          roleName,
          appRole->{
            _id,
            name,
            permissions
          },
          appRoles[]->{
            _id,
            name,
            permissions
          }
        }
      }
    },
    projects[]->{
      _id,
      name,
      internalId
    },
    status
  }
`);

export async function getPersonnelById(personnelId: string) {
  try {
    const personnel = await sanityFetch({
      query: PERSONNEL_BY_ID_QUERY,
      params: { personnelId },
      revalidate: 0,
    });

    return personnel ?? null;
  } catch (error) {
    console.error("Error fetching personnel by id", error);
    return null;
  }
}
