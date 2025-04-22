// feedback action schema
import { defineField, defineType } from "sanity";

export const feedbackAction = defineType({
  name: "feedbackAction",
  title: "Feedback Action",
  type: "document",
  fields: [
    defineField({
      name: "action",
      title: "Action",
      type: "string",
      description: "Enter the action to be taken",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      description: "Enter the description of the action",
    }),
    // assigned to array of personnel
    defineField({
      name: "assignedTo",
      title: "Assigned To",
      type: "array",
      of: [{ type: "reference", to: [{ type: "personnel" }] }],
    }),
    defineField({
      name: "dueDate",
      title: "Due Date",
      type: "date",
      description: "Enter the due date of the action",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      description: "Enter the status of the action",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Completed", value: "completed" },
        ],
      },
    }),
    defineField({
      name: "reviewedBy",
      title: "Reviewed By",
      type: "reference",
      to: [{ type: "personnel" }],
      hidden: ({ parent }) => parent?.status !== "completed",
    }),
  ],
  preview: {
    select: {
      title: "action",
      subtitle: "status",
      dueDate: "dueDate",
    },
    prepare(selection) {
      const { title, subtitle, dueDate } = selection;

      const statuses = {
        pending: {
          title: "Pending",
          value: "pending",
        },
        completed: {
          title: "Completed",
          value: "completed",
        },
      } as const;

      const status = statuses[subtitle as keyof typeof statuses] || {
        title: "Unknown Status",
        value: "unknown",
      };

      return {
        title,
        subtitle: `${status.title} | Due on ${dueDate ? new Date(dueDate).toLocaleDateString() : ""}`,
      };
    },
  },
});
