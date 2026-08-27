import { defineField, defineType } from "sanity";
import { NOTIFICATION_EVENT_OPTIONS } from "@/features/internal/notifications/events";

export const notificationSubscription = defineType({
  name: "notificationSubscription",
  title: "Notification Subscriptions",
  type: "document",
  fields: [
    defineField({
      name: "eventType",
      title: "Event",
      type: "string",
      options: {
        list: NOTIFICATION_EVENT_OPTIONS,
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "departments",
      title: "Departments",
      description:
        "Every active person in these departments is emailed when the event fires.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "department" }] }],
    }),
    defineField({
      name: "enabled",
      title: "Enabled",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      eventType: "eventType",
      enabled: "enabled",
      departments: "departments",
    },
    prepare({ eventType, enabled, departments }) {
      const option = NOTIFICATION_EVENT_OPTIONS.find(
        (item) => item.value === eventType
      );
      const count = Array.isArray(departments) ? departments.length : 0;
      return {
        title: option?.title ?? eventType ?? "Notification",
        subtitle: [
          enabled === false ? "Disabled" : "Enabled",
          count === 1 ? "1 department" : `${count} departments`,
        ].join(" · "),
      };
    },
  },
});
