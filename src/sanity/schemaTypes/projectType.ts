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
      initialValue: "noPriority",
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
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "endDate",
      title: "End Date",
      type: "datetime",
      validation: (Rule) =>
        Rule.required()
          .min(Rule.valueOfField("startDate"))
          .error("End date must be after start date"),
    }),
    defineField({
      name: "clients",
      title: "Clients",
      type: "array",
      of: [{ type: "reference", to: [{ type: "client" }] }],
    }),
    defineField({
      name: "contactPersons",
      title: "Contact Persons",
      type: "array",
      of: [{ type: "reference", to: [{ type: "contactPerson" }] }],
    }),
    defineField({
      name: "stagesCompleted",
      title: "Stages Completed",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],
});
