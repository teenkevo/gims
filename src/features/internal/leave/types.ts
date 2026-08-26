import type {
  LeavePlanStatus,
  LeaveSessionStatus,
  LeaveType,
} from "./constants";

export type LeaveStaffOption = {
  _id: string;
  fullName: string | null;
  status: string | null;
  department: string | null;
};

export type LeaveSession = {
  _key: string;
  type: LeaveType | null;
  startDate: string | null;
  endDate: string | null;
  days: number | null;
  notes: string | null;
  status: LeaveSessionStatus | null;
  relief: {
    _id: string;
    fullName: string | null;
    status: string | null;
  } | null;
};

export type LeavePlan = {
  _id: string;
  year: number | null;
  entitlementDays: number | null;
  status: LeavePlanStatus | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  employee: {
    _id: string;
    fullName: string | null;
    status: string | null;
    department: string | null;
  } | null;
  reviewedBy: {
    _id: string;
    fullName: string | null;
  } | null;
  sessions: LeaveSession[] | null;
};

export type LeaveSessionInput = {
  key?: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reliefId: string;
  notes?: string;
};
