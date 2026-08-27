import { Metadata } from "next";
import { requirePermission } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getAllDepartments } from "@/sanity/lib/departments/getAllDepartments";
import { getNotificationSubscriptions } from "@/sanity/lib/notifications/getNotificationSubscriptions";
import { NotificationsView } from "@/features/internal/notifications/components/notifications-view";

export const metadata: Metadata = {
  title: "Notifications | GIMS",
  description: "Configure department email listeners for GIMS events",
};

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const session = await requirePermission(PERMISSIONS["notifications:read"]);
  const [departments, subscriptions] = await Promise.all([
    getAllDepartments(),
    getNotificationSubscriptions(),
  ]);

  return (
    <NotificationsView
      departments={departments}
      subscriptions={subscriptions}
      canManage={session.permissions.includes(
        PERMISSIONS["notifications:manage"]
      )}
    />
  );
}
