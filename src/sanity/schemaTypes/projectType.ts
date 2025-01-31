import { defineField, defineType } from "sanity";

export const projectType = defineType({
  name: "project",
  title: "Projects",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Project Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "priority",
      title: "Priority",
      type: "string",
      options: {
        list: [
          {
            title: "No priority",
            value: "noPriority",
          },
          {
            title: "Urgent",
            value: "urgent",
          },
          {
            title: "High",
            value: "high",
          },
          {
            title: "Medium",
            value: "medium",
          },
          {
            title: "Low",
            value: "low",
          },
        ],
      },
    }),

    defineField({
      name: "startDate",
      title: "Start Date",
      type: "date",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "endDate",
      title: "Start Date",
      type: "date",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "client",
      title: "Client",
      type: "reference",
      to: { type: "client" },
    }),
    defineField({
      name: "stagesCompleted",
      title: "Stages Completed",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],
});
