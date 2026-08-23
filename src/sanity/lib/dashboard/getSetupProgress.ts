import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";

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

export type DashboardData = SetupProgress & {
  projectsDueSoon: number;
  awaitingClient: number;
  overdueProjects: number;
  needsQuotation: number;
  upcomingProjects: DashboardProject[];
  recentProjects: DashboardProject[];
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

export function countDueSoon(
  dates: Array<string | null | undefined>,
  now = new Date(),
  days = 14
) {
  const dueBy = new Date(now);
  dueBy.setDate(dueBy.getDate() + days);
  const startMs = now.getTime();
  const endMs = dueBy.getTime();

  return dates.filter((value) => {
    if (!value) return false;
    const time = new Date(value).getTime();
    if (Number.isNaN(time)) return false;
    return time >= startMs && time <= endMs;
  }).length;
}

export function countOverdue(
  dates: Array<string | null | undefined>,
  now = new Date()
) {
  const nowMs = now.getTime();
  return dates.filter((value) => {
    if (!value) return false;
    const time = new Date(value).getTime();
    if (Number.isNaN(time)) return false;
    return time < nowMs;
  }).length;
}

const EMPTY_DASHBOARD: DashboardData = {
  projects: 0,
  clients: 0,
  standards: 0,
  testMethods: 0,
  sampleClasses: 0,
  projectsDueSoon: 0,
  awaitingClient: 0,
  overdueProjects: 0,
  needsQuotation: 0,
  upcomingProjects: [],
  recentProjects: [],
};

export const getDashboardData = async (): Promise<DashboardData> => {
  const dueBy = new Date();
  dueBy.setDate(dueBy.getDate() + 14);

  const DASHBOARD_QUERY = defineQuery(`{
    "projects": count(*[_type == "project"]),
    "clients": count(*[_type == "client"]),
    "standards": count(*[_type == "standard"]),
    "testMethods": count(*[_type == "testMethod"]),
    "sampleClasses": count(*[_type == "sampleClass"]),
    "projectsDueSoon": count(*[_type == "project" && defined(endDate) && endDate >= now() && endDate <= $dueBy]),
    "awaitingClient": count(*[_type == "project" && quotation->status == "sent"]),
    "overdueProjects": count(*[_type == "project" && defined(endDate) && endDate < now()]),
    "needsQuotation": count(*[_type == "project" && !defined(quotation)]),
    "upcomingProjects": *[_type == "project" && defined(endDate) && endDate >= now()] | order(endDate asc) [0...6] ${PROJECT_PROJECTION},
    "recentProjects": *[_type == "project"] | order(internalId desc) [0...6] ${PROJECT_PROJECTION}
  }`);

  try {
    const data = await sanityFetch({
      query: DASHBOARD_QUERY,
      params: {
        dueBy: dueBy.toISOString(),
      },
      revalidate: 0,
    });

    return {
      ...EMPTY_DASHBOARD,
      ...data,
      upcomingProjects: data?.upcomingProjects ?? [],
      recentProjects: data?.recentProjects ?? [],
    };
  } catch (error) {
    console.error("Error fetching dashboard data", error);
    return EMPTY_DASHBOARD;
  }
};
