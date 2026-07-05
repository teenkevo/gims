import type { StructureResolver } from "sanity/structure";
import {
  BookIcon,
  BottleIcon,
  CaseIcon,
  CogIcon,
  DocumentsIcon,
  UsersIcon,
} from "@sanity/icons";

// https://www.sanity.io/docs/structure-builder-cheat-sheet

const GROUPED_DOCUMENT_TYPES = [
  "department",
  "personnel",
  "lab",
  "project",
  "quotation",
  "revision",
  "rfi",
  "client",
  "contactPerson",
  "clientFeedback",
  "feedbackAction",
  "equipment",
  "maintenanceLog",
  "labApprovalWorkflow",
  "sampleReceipt",
  "sampleReviewTemplate",
  "sampleAdequacyTemplate",
  "standard",
  "testMethod",
  "sampleClass",
  "labTest",
  "fieldTest",
  "service",
  "appRole",
  "appUser",
  "auditLog",
] as const;

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Organization")
        .icon(UsersIcon)
        .child(
          S.list()
            .title("Organization")
            .items([
              S.documentTypeListItem("department").title("Departments"),
              S.documentTypeListItem("personnel").title("Personnel"),
              S.documentTypeListItem("lab").title("Labs"),
            ])
        ),

      S.listItem()
        .title("Projects & delivery")
        .icon(DocumentsIcon)
        .child(
          S.list()
            .title("Projects & delivery")
            .items([
              S.documentTypeListItem("project").title("Projects"),
              S.documentTypeListItem("quotation").title("Quotations"),
              S.documentTypeListItem("revision").title("Revisions"),
              S.documentTypeListItem("rfi").title("Requests for Information"),
            ])
        ),

      S.listItem()
        .title("Clients & stakeholders")
        .icon(CaseIcon)
        .child(
          S.list()
            .title("Clients & stakeholders")
            .items([
              S.documentTypeListItem("client").title("Clients"),
              S.documentTypeListItem("contactPerson").title("Contact Persons"),
              S.documentTypeListItem("clientFeedback").title("Client Feedback"),
              S.documentTypeListItem("feedbackAction").title("Feedback Actions"),
            ])
        ),

      S.listItem()
        .title("Lab operations")
        .icon(BottleIcon)
        .child(
          S.list()
            .title("Lab operations")
            .items([
              S.documentTypeListItem("equipment").title("Equipment"),
              S.documentTypeListItem("maintenanceLog").title("Maintenance Logs"),
              S.documentTypeListItem("labApprovalWorkflow").title(
                "Approval Workflows"
              ),
              S.documentTypeListItem("sampleReceipt").title("Sample Receipts"),
              S.documentTypeListItem("sampleReviewTemplate").title(
                "Sample Review Templates"
              ),
              S.documentTypeListItem("sampleAdequacyTemplate").title(
                "Sample Adequacy Templates"
              ),
            ])
        ),

      S.listItem()
        .title("Services catalog")
        .icon(BookIcon)
        .child(
          S.list()
            .title("Services catalog")
            .items([
              S.documentTypeListItem("standard").title("Standards"),
              S.documentTypeListItem("testMethod").title("Test Methods"),
              S.documentTypeListItem("sampleClass").title("Sample Classes"),
              S.documentTypeListItem("labTest").title("Lab Tests"),
              S.documentTypeListItem("fieldTest").title("Field Tests"),
              S.documentTypeListItem("service").title("Services"),
            ])
        ),

      S.listItem()
        .title("Platform")
        .icon(CogIcon)
        .child(
          S.list()
            .title("Platform")
            .items([
              S.documentTypeListItem("appRole").title("Permission Sets"),
              S.documentTypeListItem("appUser").title("App Users"),
              S.documentTypeListItem("auditLog").title("Audit Logs"),
            ])
        ),

      S.divider(),

      ...S.documentTypeListItems().filter(
        (item) =>
          !GROUPED_DOCUMENT_TYPES.includes(
            item.getId() as (typeof GROUPED_DOCUMENT_TYPES)[number]
          )
      ),
    ]);
