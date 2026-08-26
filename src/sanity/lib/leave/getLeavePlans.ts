import { defineQuery } from "next-sanity";
import { sanityFetch } from "../client";
import type { LeavePlan, LeaveStaffOption } from "@/features/internal/leave/types";

const LEAVE_PLANS_QUERY = defineQuery(`
  *[_type == "leavePlan" && year in $years] | order(year desc, employee->fullName asc) {
    _id,
    year,
    entitlementDays,
    status,
    submittedAt,
    reviewedAt,
    reviewNote,
    employee->{
      _id,
      fullName,
      status,
      "department": departmentRoles[0].department->department
    },
    reviewedBy->{
      _id,
      fullName
    },
    sessions[] {
      _key,
      type,
      startDate,
      endDate,
      days,
      notes,
      status,
      relief->{
        _id,
        fullName,
        status
      }
    }
  }
`);

const LEAVE_STAFF_QUERY = defineQuery(`
  *[_type == "personnel" && status in ["active", "on-leave"]] | order(fullName asc) {
    _id,
    fullName,
    status,
    "department": departmentRoles[0].department->department
  }
`);

export async function getLeavePlans(years: number[]) {
  try {
    const plans = await sanityFetch({
      query: LEAVE_PLANS_QUERY,
      params: { years },
      tags: ["leavePlan"],
      revalidate: 0,
    });
    return (plans ?? []) as LeavePlan[];
  } catch (error) {
    console.error("Error fetching leave plans", error);
    return [];
  }
}

export async function getLeaveStaff() {
  try {
    const staff = await sanityFetch({
      query: LEAVE_STAFF_QUERY,
      tags: ["personnel"],
      revalidate: 0,
    });
    return (staff ?? []) as LeaveStaffOption[];
  } catch (error) {
    console.error("Error fetching leave staff", error);
    return [];
  }
}
