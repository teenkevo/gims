import { defineField, defineType } from "sanity";

export const workOrder = defineType({
  name: "workOrder",
  title: "Work Order",
  type: "document",
  fields: [
    defineField({
      name: "project",
      title: "Project",
      type: "reference",
      to: [{ type: "project" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "lab",
      title: "Laboratory",
      type: "reference",
      to: [{ type: "lab" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "workOrderNumber",
      title: "Work Order Number",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "Sent", value: "sent" },
          { title: "Acknowledged", value: "acknowledged" },
        ],
      },
      initialValue: "draft",
    }),
    defineField({
      name: "notes",
      title: "Notes",
      type: "text",
    }),
    defineField({
      name: "sentAt",
      title: "Sent At",
      type: "datetime",
    }),
    defineField({
      name: "acknowledgedAt",
      title: "Acknowledged At",
      type: "datetime",
    }),
  ],
  preview: {
    select: {
      number: "workOrderNumber",
      status: "status",
      lab: "lab.name",
      project: "project.name",
    },
    prepare({ number, status, lab, project }) {
      return {
        title: number || "Work order",
        subtitle: `${project || "?"} → ${lab || "?"} · ${status || "draft"}`,
      };
    },
  },
});
