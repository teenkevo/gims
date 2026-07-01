import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";

export type DepartmentPersonnelRow = {
  _id: string;
  fullName: string;
  email: string;
  status: string;
  appAccessStatus?: string;
  role: string;
};

export type DepartmentDetail = {
  _id: string;
  department: string;
  createdBy?: string;
  modifiedBy?: string;
  _createdAt: string;
  roles: Array<{
    roleName?: string;
    appRole?: { _id: string; name: string } | null;
  }>;
  personnel: DepartmentPersonnelRow[];
};

const DEPARTMENT_DETAIL_QUERY = defineQuery(`
  *[_type == "department" && _id == $departmentId][0] {
    _id,
    department,
    createdBy,
    modifiedBy,
    _createdAt,
    roles[] {
      roleName,
      appRole->{
        _id,
        name
      }
    }
  }
`);

const DEPARTMENT_PERSONNEL_QUERY = defineQuery(`
  *[_type == "personnel" && references($departmentId)] | order(fullName asc) {
    _id,
    fullName,
    email,
    status,
    appAccessStatus,
    departmentRoles[] {
      role,
      "departmentId": department._ref
    }
  }
`);

export type PersonnelPickerOption = {
  _id: string;
  fullName: string;
  email: string;
  departmentIds: string[];
};

const PERSONNEL_PICKER_QUERY = defineQuery(`
  *[_type == "personnel"] | order(fullName asc) {
    _id,
    fullName,
    email,
    departmentRoles[] {
      "departmentId": department._ref
    }
  }
`);

const ADMINISTRATION_ROLES_QUERY = defineQuery(`
  *[_type == "department" && lower(department) == "administration"][0].roles[].roleName
`);

export type DepartmentEditorData = {
  _id: string;
  department: string;
  roles: Array<{
    roleName?: string;
    appRole?: { _id: string; name: string } | null;
  }>;
};

export async function getDepartmentEditorData(
  departmentId: string
): Promise<DepartmentEditorData | null> {
  try {
    const department = await sanityFetch({
      query: DEPARTMENT_DETAIL_QUERY,
      params: { departmentId },
      revalidate: 0,
    });
    return department ?? null;
  } catch (error) {
    console.error("Error fetching department editor data", error);
    return null;
  }
}

export async function getDepartmentDetail(
  departmentId: string
): Promise<DepartmentDetail | null> {
  try {
    const [department, personnel] = await Promise.all([
      sanityFetch({
        query: DEPARTMENT_DETAIL_QUERY,
        params: { departmentId },
        revalidate: 0,
      }),
      sanityFetch({
        query: DEPARTMENT_PERSONNEL_QUERY,
        params: { departmentId },
        revalidate: 0,
      }),
    ]);

    if (!department) return null;

    const personnelRows: DepartmentPersonnelRow[] = (personnel ?? []).map(
      (person: {
        _id: string;
        fullName: string;
        email: string;
        status: string;
        appAccessStatus?: string;
        departmentRoles?: Array<{ role?: string; departmentId?: string }>;
      }) => ({
        _id: person._id,
        fullName: person.fullName,
        email: person.email,
        status: person.status,
        appAccessStatus: person.appAccessStatus,
        role:
          person.departmentRoles?.find((entry) => entry.departmentId === departmentId)
            ?.role ?? "—",
      })
    );

    return {
      ...department,
      personnel: personnelRows,
    };
  } catch (error) {
    console.error("Error fetching department detail", error);
    return null;
  }
}

export async function getPersonnelPickerOptions(
  excludeDepartmentId?: string
): Promise<PersonnelPickerOption[]> {
  try {
    const personnel = await sanityFetch({
      query: PERSONNEL_PICKER_QUERY,
      revalidate: 0,
    });

    return (personnel ?? [])
      .map(
        (person: {
          _id: string;
          fullName: string;
          email: string;
          departmentRoles?: Array<{ departmentId?: string }>;
        }) => ({
          _id: person._id,
          fullName: person.fullName,
          email: person.email,
          departmentIds:
            person.departmentRoles
              ?.map((entry) => entry.departmentId)
              .filter((id): id is string => Boolean(id)) ?? [],
        })
      )
      .filter(
        (person) =>
          !excludeDepartmentId || !person.departmentIds.includes(excludeDepartmentId)
      );
  } catch (error) {
    console.error("Error fetching personnel picker options", error);
    return [];
  }
}

export async function getAdministrationDepartmentRoles(): Promise<string[]> {
  try {
    const roles = await sanityFetch({
      query: ADMINISTRATION_ROLES_QUERY,
      revalidate: 0,
    });

    return (roles ?? []).filter(
      (roleName): roleName is string => Boolean(roleName)
    );
  } catch (error) {
    console.error("Error fetching administration department roles", error);
    return [];
  }
}
