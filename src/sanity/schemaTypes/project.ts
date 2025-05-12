import { defineField, defineType } from "sanity";

export const project = defineType({
  name: "project",
  title: "Projects",
  type: "document",
  fields: [
    defineField({
      name: "internalId",
      title: "Internal ID",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
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
      validation: (Rule) =>
        Rule.custom((startDate, { document }) => {
          const endDate = document?.endDate;
          if (startDate && !endDate) {
            return "If start date is selected, end date must also be selected.";
          }
          return true;
        }),
    }),
    defineField({
      name: "endDate",
      title: "End Date",
      type: "datetime",
      validation: (Rule) =>
        Rule.custom((endDate, { document }) => {
          const startDate = document?.startDate;
          if (endDate && !startDate) {
            return "If end date is selected, start date must also be selected.";
          }
          return true;
          // return Rule.required()
          //   .min(Rule.valueOfField("startDate"))
          //   .error("End date must be after start date");
        })
          .min(Rule.valueOfField("startDate"))
          .error("End date must be after start date"),
    }),
    // link project to multiple personnel
    defineField({
      name: "projectPersonnel",
      type: "array",
      title: "Project Personnel",
      of: [{ type: "reference", to: [{ type: "personnel" }] }],
    }),
    defineField({
      name: "projectSupervisors",
      type: "array",
      title: "Project Supervisors",
      of: [{ type: "reference", to: [{ type: "personnel" }] }],
      description: "Supervisors responsible for projects assigned to this lab.",
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
    defineField({
      name: "quotation",
      title: "Quotation",
      type: "reference",
      to: [{ type: "quotation" }],
    }),
  ],
});
