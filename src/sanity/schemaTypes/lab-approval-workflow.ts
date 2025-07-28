import { defineField, defineType } from "sanity";
import { CogIcon } from "@sanity/icons";
import { FileTextIcon, UserCheckIcon } from "lucide-react";
import { CheckCircleIcon } from "lucide-react";

export const labApprovalWorkflow = defineType({
  name: "labApprovalWorkflow",
  type: "document",
  title: "Lab Approval Workflows",
  fields: [
    defineField({
      name: "lab",
      type: "reference",
      to: [{ type: "lab" }],
      title: "Laboratory",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "workflowType",
      type: "string",
      title: "Workflow Type",
      options: {
        list: [
          {
            title: "Equipment Release Approval",
            value: "equipment_release_approval",
          },
          { title: "Test Result Approval", value: "test_result_approval" },
          { title: "Lab Access Approval", value: "lab_access_approval" },
          { title: "SOP Change Approval", value: "sop_change_approval" },
          { title: "Funds Request Approval", value: "funds_request_approval" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "initiatedBy",
      type: "reference",
      to: [{ type: "personnel" }],
      title: "Initiated By",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "approvalSteps",
      type: "array",
      title: "Approval Steps",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "approver",
              type: "reference",
              to: [{ type: "personnel" }],
              title: "Approver",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "decision",
              type: "string",
              title: "Approval Decision",
              options: {
                list: [
                  { title: "Pending", value: "pending" },
                  { title: "Approved", value: "approved" },
                  { title: "Rejected", value: "rejected" },
                ],
              },
              initialValue: "pending",
            }),
            defineField({
              name: "approvalDate",
              type: "datetime",
              title: "Approval Date",
            }),
            defineField({
              name: "notes",
              type: "text",
              title: "Approval Notes",
              description: "Reason for approval or rejection",
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "finalDecision",
      type: "string",
      title: "Final Decision",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Approved", value: "approved" },
          { title: "Rejected", value: "rejected" },
        ],
      },
      initialValue: "pending",
    }),
    defineField({
      name: "finalDecisionDate",
      type: "datetime",
      title: "Final Decision Date",
    }),
    defineField({
      name: "rfi",
      type: "reference",
      to: [{ type: "rfi" }],
      title: "RFI",
    }),
    defineField({
      name: "status",
      type: "string",
      title: "Overall Workflow Status",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "In Progress", value: "in_progress" },
          { title: "Approved", value: "approved" },
          { title: "Rejected", value: "rejected" },
        ],
      },
      initialValue: "pending",
    }),
  ],
  preview: {
    select: {
      workflowType: "workflowType",
      initiatedBy: "initiatedBy.fullName",
      customIcon: "icon", // User-uploaded icon (if available)
    },
    prepare(selection) {
      const { workflowType, initiatedBy, customIcon } = selection;

      // Map workflow types to readable titles and icons
      const workflowTypes = {
        equipment_release_approval: {
          title: "Equipment Release Approval",
          icon: CogIcon,
        },
        test_result_approval: {
          title: "Test Result Approval",
          icon: CheckCircleIcon,
        },
        lab_access_approval: {
          title: "Lab Access Approval",
          icon: UserCheckIcon,
        },
        sop_change_approval: {
          title: "SOP Change Approval",
          icon: FileTextIcon,
        },
      };

      const type = workflowTypes[
        workflowType as keyof typeof workflowTypes
      ] || {
        title: "Unknown Workflow Type",
        icon: FileTextIcon,
      };

      return {
        title: type.title,
        subtitle: initiatedBy
          ? `Initiated by: ${initiatedBy}`
          : "Lab Approval Workflow",
        media: customIcon || type.icon, // Show uploaded icon if available, else use default icon
      };
    },
  },
});
