import { defineField, defineType } from "sanity";

export const leavePlan = defineType({
  name: "leavePlan",
  title: "Leave Plans",
  type: "document",
  fields: [
    defineField({
      name: "employee",
      title: "Employee",
      type: "reference",
      to: [{ type: "personnel" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "number",
      validation: (Rule) => Rule.required().integer().min(2020).max(2100),
    }),
    defineField({
      name: "entitlementDays",
      title: "Annual entitlement (working days)",
      type: "number",
      initialValue: 21,
      validation: (Rule) => Rule.required().integer().min(0),
    }),
    defineField({
      name: "status",
      title: "Plan status",
      type: "string",
      initialValue: "draft",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "Submitted", value: "submitted" },
          { title: "Approved", value: "approved" },
          { title: "Changes requested", value: "changes_requested" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "sessions",
      title: "Leave sessions",
      type: "array",
      validation: (Rule) =>
        Rule.custom((sessions) => {
          const items = (sessions ?? []) as Array<{
            startDate?: string;
            endDate?: string;
            relief?: { _ref?: string };
            status?: string;
          }>;

          const active = items.filter((session) => session.status !== "cancelled");
          for (const session of active) {
            if (!session.relief?._ref) {
              return "Every leave session needs a relief person.";
            }
            if (
              session.startDate &&
              session.endDate &&
              session.endDate < session.startDate
            ) {
              return "A session ends before it starts.";
            }
          }
          return true;
        }),
      of: [
        {
          type: "object",
          name: "leaveSession",
          title: "Leave session",
          fields: [
            defineField({
              name: "type",
              title: "Type",
              type: "string",
              options: {
                list: [
                  { title: "Annual", value: "annual" },
                  { title: "Sick", value: "sick" },
                  { title: "Compassionate", value: "compassionate" },
                  { title: "Study", value: "study" },
                  { title: "Parental", value: "parental" },
                  { title: "Unpaid", value: "unpaid" },
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "startDate",
              title: "Start date",
              type: "date",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "endDate",
              title: "End date",
              type: "date",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "days",
              title: "Working days",
              type: "number",
              validation: (Rule) => Rule.integer().min(1),
            }),
            defineField({
              name: "relief",
              title: "Relief person",
              type: "reference",
              to: [{ type: "personnel" }],
              validation: (Rule) => Rule.required(),
              description:
                "Colleague who covers this person's duties while they are away.",
            }),
            defineField({
              name: "notes",
              title: "Notes",
              type: "text",
              rows: 2,
            }),
            defineField({
              name: "status",
              title: "Session status",
              type: "string",
              initialValue: "planned",
              options: {
                list: [
                  { title: "Planned", value: "planned" },
                  { title: "Pending approval", value: "pending" },
                  { title: "Approved", value: "approved" },
                  { title: "Cancelled", value: "cancelled" },
                ],
              },
            }),
          ],
          preview: {
            select: {
              type: "type",
              startDate: "startDate",
              endDate: "endDate",
              relief: "relief.fullName",
              status: "status",
            },
            prepare({ type, startDate, endDate, relief, status }) {
              return {
                title: `${type ?? "Leave"} · ${startDate ?? "?"} – ${endDate ?? "?"}`,
                subtitle: `Relief: ${relief ?? "Unassigned"} · ${status ?? "planned"}`,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "submittedAt",
      title: "Submitted at",
      type: "datetime",
    }),
    defineField({
      name: "reviewedBy",
      title: "Reviewed by",
      type: "reference",
      to: [{ type: "personnel" }],
    }),
    defineField({
      name: "reviewedAt",
      title: "Reviewed at",
      type: "datetime",
    }),
    defineField({
      name: "reviewNote",
      title: "Review note",
      type: "text",
      rows: 3,
    }),
  ],
  preview: {
    select: {
      employee: "employee.fullName",
      year: "year",
      status: "status",
    },
    prepare({ employee, year, status }) {
      return {
        title: `${employee ?? "Unknown"} · ${year ?? ""}`,
        subtitle: status,
      };
    },
  },
  orderings: [
    {
      title: "Year, newest",
      name: "yearDesc",
      by: [{ field: "year", direction: "desc" }],
    },
  ],
});
