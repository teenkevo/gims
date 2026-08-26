import { Metadata } from "next";
import { requirePermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getLeavePlans, getLeaveStaff } from "@/sanity/lib/leave/getLeavePlans";
import { LeaveView } from "@/features/internal/leave/components/leave-view";

export const metadata: Metadata = {
  title: "Leave Management | GIMS",
  description: "Plan annual leave and assign relief cover for every session.",
};

export const dynamic = "force-dynamic";

export default async function LeavePage() {
  const session = await requirePermission(PERMISSIONS["leave:read"]);
  const year = new Date().getFullYear();
  const [plans, staff] = await Promise.all([
    getLeavePlans([year - 1, year, year + 1]),
    getLeaveStaff(),
  ]);

  return (
    <LeaveView
      year={year}
      plans={plans}
      staff={staff}
      personnelId={session.personnelId}
    />
  );
}
