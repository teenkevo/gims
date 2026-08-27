import { sanityFetch } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/write-client";
import {
  isNotificationEventType,
  type NotificationEventType,
} from "@/features/internal/notifications/events";

export type NotificationSubscriptionRecord = {
  _id: string;
  eventType: NotificationEventType;
  enabled: boolean;
  departments: Array<{ _id: string; department?: string | null }>;
};

const NOTIFICATION_SUBSCRIPTIONS_QUERY = `*[_type == "notificationSubscription"]{
    _id,
    eventType,
    enabled,
    departments[]->{
      _id,
      department
    }
  }`;

export async function getNotificationSubscriptions(): Promise<
  NotificationSubscriptionRecord[]
> {
  try {
    const docs = await sanityFetch({
      query: NOTIFICATION_SUBSCRIPTIONS_QUERY,
      tags: ["notifications"],
    });

    return normalizeSubscriptions(
      (docs ?? []) as Array<{
        _id: string;
        eventType?: string;
        enabled?: boolean;
        departments?: Array<{ _id: string; department?: string | null } | null>;
      }>
    );
  } catch (error) {
    console.error("Error fetching notification subscriptions", error);
    return [];
  }
}

function normalizeSubscriptions(
  docs: Array<{
    _id: string;
    eventType?: string;
    enabled?: boolean;
    departments?: Array<{ _id: string; department?: string | null } | null>;
  }>
): NotificationSubscriptionRecord[] {
  return docs.flatMap((doc) => {
    if (!doc.eventType || !isNotificationEventType(doc.eventType)) {
      return [];
    }
    return [
      {
        _id: doc._id,
        eventType: doc.eventType,
        enabled: doc.enabled !== false,
        departments: (doc.departments ?? []).flatMap((department) =>
          department?._id
            ? [{ _id: department._id, department: department.department }]
            : []
        ),
      },
    ];
  });
}

export async function getEnabledSubscriptionsForEvent(
  eventType: NotificationEventType
): Promise<NotificationSubscriptionRecord[]> {
  const docs = await writeClient.fetch<
    Array<{
      _id: string;
      eventType?: string;
      enabled?: boolean;
      departments?: Array<{ _id: string; department?: string | null } | null>;
    }>
  >(
    `*[_type == "notificationSubscription" && eventType == $eventType && enabled != false]{
      _id,
      eventType,
      enabled,
      departments[]->{ _id, department }
    }`,
    { eventType }
  );

  return normalizeSubscriptions(docs ?? []);
}
