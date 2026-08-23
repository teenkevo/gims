import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";
import { countOverdue, isOverdue } from "@/lib/project-due";

export { countOverdue } from "@/lib/project-due";

export type SetupProgress = {
  projects: number;
  clients: number;
  standards: number;
  testMethods: number;
  sampleClasses: number;
};

export type DashboardProject = {
  _id: string;
  name: string | null;
  internalId: string | null;
  startDate: string | null;
  endDate: string | null;
  quoted: boolean;
  clientName: string | null;
};

export type LabWorkload = {
  _id: string;
  name: string | null;
  internalId: string | null;
  labSection: string | null;
  status: string | null;
  capacity: number | null;
  projectCount: number;
  staffCount: number;
};

export type StaffWorkload = {
  _id: string;
  fullName: string | null;
  internalId: string | null;
  projectCount: number;
  labs: LabWorkload[];
};

export type DashboardData = SetupProgress & {
  projectsAtStartOfMonth: number;
  awaitingClient: number;
  overdueProjects: number;
  needsQuotation: number;
  upcomingProjects: DashboardProject[];
  recentProjects: DashboardProject[];
  labWorkload: LabWorkload[];
  staffWorkload: StaffWorkload[];
};

const PROJECT_PROJECTION = `{
  _id,
  name,
  internalId,
  startDate,
  endDate,
  "quoted": defined(quotation),
  "clientName": clients[0]->name
}`;

const INACTIVE_STAFF_STATUSES = new Set([
  "inactive",
  "terminated",
  "retired",
  "resigned",
]);

type WorkloadLabRow = {
  _id: string;
  name: string | null;
  internalId: string | null;
  labSection: string | null;
  status: string | null;
  capacity: number | null;
  projectCount: number | null;
  personnel: Array<{
    _id: string;
    fullName: string | null;
    internalId: string | null;
    status: string | null;
    projectCount: number | null;
  } | null> | null;
  labHead: {
    _id: string;
    fullName: string | null;
    internalId: string | null;
    status: string | null;
    projectCount: number | null;
  } | null;
};

function isActiveStaff(status: string | null | undefined) {
  if (!status) return true;
  return !INACTIVE_STAFF_STATUSES.has(status);
}

function toWorkload(labs: WorkloadLabRow[] | null | undefined): {
  labWorkload: LabWorkload[];
  staffWorkload: StaffWorkload[];
} {
  const labWorkload: LabWorkload[] = (labs ?? []).map((lab) => ({
    _id: lab._id,
    name: lab.name ?? null,
    internalId: lab.internalId ?? null,
    labSection: lab.labSection ?? null,
    status: lab.status ?? null,
    capacity: lab.capacity ?? null,
    projectCount: lab.projectCount ?? 0,
    staffCount: (lab.personnel ?? []).filter(
      (person): person is NonNullable<typeof person> =>
        Boolean(person) && isActiveStaff(person?.status)
    ).length,
  }));

  const labById = new Map(labWorkload.map((lab) => [lab._id, lab]));
  const staffMap = new Map<string, StaffWorkload>();

  const addStaff = (
    person: NonNullable<NonNullable<WorkloadLabRow["personnel"]>[number]>,
    labId: string
  ) => {
    if (!isActiveStaff(person.status)) return;
    const lab = labById.get(labId);
    if (!lab) return;

    let entry = staffMap.get(person._id);
    if (!entry) {
      entry = {
        _id: person._id,
        fullName: person.fullName ?? null,
        internalId: person.internalId ?? null,
        projectCount: 0,
        labs: [],
      };
      staffMap.set(person._id, entry);
    }

    entry.projectCount = person.projectCount ?? 0;
    if (!entry.labs.some((assigned) => assigned._id === lab._id)) {
      entry.labs.push(lab);
    }
  };

  for (const lab of labs ?? []) {
    for (const person of lab.personnel ?? []) {
      if (person) addStaff(person, lab._id);
    }
    if (lab.labHead) addStaff(lab.labHead, lab._id);
  }

  return {
    labWorkload,
    staffWorkload: [...staffMap.values()],
  };
}

const EMPTY_DASHBOARD: DashboardData = {
  projects: 0,
  clients: 0,
  standards: 0,
  testMethods: 0,
  sampleClasses: 0,
  projectsAtStartOfMonth: 0,
  awaitingClient: 0,
  overdueProjects: 0,
  needsQuotation: 0,
  upcomingProjects: [],
  recentProjects: [],
  labWorkload: [],
  staffWorkload: [],
};

export const getDashboardData = async (): Promise<DashboardData> => {
  const now = new Date();
  const startOfThisMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  ).toISOString();

  const DASHBOARD_QUERY = defineQuery(`{
    "projects": count(*[_type == "project"]),
    "clients": count(*[_type == "client"]),
    "standards": count(*[_type == "standard"]),
    "testMethods": count(*[_type == "testMethod"]),
    "sampleClasses": count(*[_type == "sampleClass"]),
    "projectsAtStartOfMonth": count(*[_type == "project" && _createdAt < $startOfThisMonth]),
    "awaitingClient": count(*[_type == "project" && quotation->status == "sent"]),
    "needsQuotation": count(*[_type == "project" && !defined(quotation)]),
    "datedProjects": *[_type == "project" && defined(endDate)] | order(endDate asc) ${PROJECT_PROJECTION},
    "recentProjects": *[_type == "project"] | order(internalId desc) [0...6] ${PROJECT_PROJECTION},
    "workloadLabs": *[_type == "lab" && status != "retired"] | order(name asc) {
      _id,
      name,
      internalId,
      labSection,
      status,
      capacity,
      "projectCount": count(projects),
      personnel[]->{
        _id,
        fullName,
        internalId,
        status,
        "projectCount": count(*[_type == "project" && ^._id in projectPersonnel[]._ref])
      },
      labHead->{
        _id,
        fullName,
        internalId,
        status,
        "projectCount": count(*[_type == "project" && ^._id in projectPersonnel[]._ref])
      }
    }
  }`);

  try {
    const data = await sanityFetch({
      query: DASHBOARD_QUERY,
      params: {
        startOfThisMonth,
      },
      revalidate: 0,
    });

    const { workloadLabs, datedProjects, ...dashboard } = data ?? {};
    const { labWorkload, staffWorkload } = toWorkload(
      workloadLabs as WorkloadLabRow[] | null | undefined
    );
    const dated = (datedProjects ?? []) as DashboardProject[];
    const overdueProjects = countOverdue(dated.map((project) => project.endDate));
    const upcomingProjects = dated
      .filter((project) => project.endDate && !isOverdue(project.endDate))
      .slice(0, 6);

    return {
      ...EMPTY_DASHBOARD,
      ...dashboard,
      overdueProjects,
      upcomingProjects,
      recentProjects: dashboard.recentProjects ?? [],
      labWorkload,
      staffWorkload,
    };
  } catch (error) {
    console.error("Error fetching dashboard data", error);
    return EMPTY_DASHBOARD;
  }
};
