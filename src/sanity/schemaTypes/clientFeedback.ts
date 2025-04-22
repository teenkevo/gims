import { MessageCircleMore } from "lucide-react";
import { defineField, defineType } from "sanity";

export const clientFeedback = defineType({
  name: "clientFeedback",
  title: "Client Feedback",
  type: "document",
  fields: [
    defineField({
      name: "client",
      title: "Client",
      type: "reference",
      to: [{ type: "client" }], // Reference to Client
      validation: (Rule) => Rule.required(),
    }),
    // contact person
    defineField({
      name: "contactPerson",
      title: "Contact Person",
      type: "reference",
      to: [{ type: "contactPerson" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "datetime",
      options: { dateFormat: "YYYY-MM-DD" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "feedback",
      title: "Client Feedback",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "category",
              title: "Feedback Category",
              type: "string",
              options: {
                list: [
                  {
                    title: "Enquiry Handling and Response Time",
                    value: "enquiry",
                  },
                  { title: "Handling of Sample", value: "sampleHandling" },
                  {
                    title: "Quality of Test Certificates",
                    value: "testQuality",
                  },
                  {
                    title: "Technical Knowledge of Staff",
                    value: "technicalKnowledge",
                  },
                  {
                    title: "Delivery Time (Work Completion)",
                    value: "deliveryTime",
                  },
                  {
                    title: "Presentation of Test Certificate",
                    value: "presentation",
                  },
                  { title: "Complaint Handling", value: "complaintHandling" },
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "rating",
              title: "Rating",
              type: "string",
              options: {
                list: ["Excellent", "Good", "Satisfactory", "Average", "Poor"],
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "comments",
              title: "Comments",
              type: "text",
            }),
          ],
          preview: {
            select: {
              category: "category",
              rating: "rating",
            },
            prepare(selection) {
              const { category, rating } = selection;
              const feedbackCategories = {
                enquiry: {
                  title: "Enquiry Handling and Response Time",
                  value: "enquiry",
                },
                sampleHandling: {
                  title: "Handling of Sample",
                  value: "sampleHandling",
                },
                testQuality: {
                  title: "Quality of Test Certificates",
                  value: "testQuality",
                },
                technicalKnowledge: {
                  title: "Technical Knowledge of Staff",
                  value: "technicalKnowledge",
                },
                deliveryTime: {
                  title: "Delivery Time (Work Completion)",
                  value: "deliveryTime",
                },
                presentation: {
                  title: "Presentation of Test Certificate",
                  value: "presentation",
                },
                complaintHandling: {
                  title: "Complaint Handling",
                  value: "complaintHandling",
                },
              } as const;

              type FeedbackCategoryKey = keyof typeof feedbackCategories;
              const cat = feedbackCategories[
                category as FeedbackCategoryKey
              ] || {
                title: "Unknown Feedback Category",
                icon: MessageCircleMore,
              };

              return {
                title: cat.title,
                subtitle: rating,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "suggestions",
      title: "Any Other Suggestions for Improvement",
      type: "text",
    }),
    // toggle to check if corrective action is needed
    defineField({
      name: "actionNeeded",
      title: "Is any action needed? (Internal Use Only)",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "actions",
      title: "Actions (Internal Use Only)",
      type: "array",
      of: [{ type: "reference", to: [{ type: "feedbackAction" }] }],
      hidden: ({ parent }) => !parent?.actionNeeded,
    }),
  ],
  preview: {
    select: {
      title: "client.name",
      subtitle: "date",
    },
    prepare(selection) {
      const { title, subtitle } = selection;

      return {
        title: `Feedback from ${title}`,
        subtitle: `Date: ${new Date(subtitle).toLocaleDateString()}`,
      };
    },
  },
});
