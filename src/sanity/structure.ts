import type { StructureResolver } from "sanity/structure";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title("GIMS Modules")
    .items([
      S.documentTypeListItem("project").title("Projects"),
      S.documentTypeListItem("quotation").title("Quotations"),
      S.listItem()
        .title("Labs")
        .child(
          S.list()
            .title("Labs")
            .items([
              S.documentTypeListItem("lab").title("Labs"),
              S.documentTypeListItem("personnel")
                .title("Lab Departments and Personnel")
                .child(
                  S.list()
                    .title("Lab Departments and Personnel")
                    .items([
                      S.documentTypeListItem("department").title("Departments"),
                      S.documentTypeListItem("personnel").title("Personnel"),
                    ])
                ),
              S.documentTypeListItem("equipment").title("Lab Equipment"),
              S.documentTypeListItem("maintenanceLog").title(
                "Lab Maintenance Logs"
              ),
              S.documentTypeListItem("labApprovalWorkflow").title(
                "Lab Approval Workflows"
              ),
            ])
        ),

      S.listItem()
        .title("Clients")
        .child(
          S.list()
            .title("Clients")
            .items([
              S.documentTypeListItem("client").title("Clients"),
              S.documentTypeListItem("contactPerson").title("Contact Persons"),
              S.documentTypeListItem("clientFeedback").title("Client Feedback"),
            ])
        ),

      S.listItem()
        .title("Services")
        .child(
          S.list()
            .title("Services")
            .items([
              S.documentTypeListItem("standard").title("Standards"),
              S.documentTypeListItem("testMethod").title("Test Methods"),
              S.documentTypeListItem("sampleClass").title("Sample Classes"),
              S.documentTypeListItem("labTest").title("Lab Tests"),
              S.documentTypeListItem("fieldTest").title("Field Tests"),
              S.documentTypeListItem("service").title("Services"),
            ])
        ),
      S.documentTypeListItem("rfi").title("Requests for Information (RFIs)"),
      S.listItem()
        .title("Sample Receipts")
        .child(
          S.list()
            .title("Sample Receipts")
            .items([
              S.documentTypeListItem("sampleReceipt").title("Sample Receipts"),
              S.documentTypeListItem("sampleReviewTemplate")
                .title("Sample Receipt Templates")
                .child(
                  S.list()
                    .title("Sample Receipt Templates")
                    .items([
                      S.documentTypeListItem("sampleReviewTemplate").title(
                        "Sample Review Template"
                      ),
                      S.documentTypeListItem("sampleAdequacyTemplate").title(
                        "Sample Adequacy Template"
                      ),
                    ])
                ),
            ])
        ),
      // S.documentTypeListItem("sampleReviewTemplate").title(
      //   "Sample Review Templates"
      // ),
      // S.documentTypeListItem("sampleAdequacyTemplate").title(
      //   "Sample Adequacy Templates"
      // ),
    ]);
