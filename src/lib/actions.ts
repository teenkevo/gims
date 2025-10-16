"use server";
import { writeClient } from "@/sanity/lib/write-client";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { sanitizePhoneNumber } from "./utils";
import { v4 as uuidv4 } from "uuid";
import {
  ALL_SERVICES_QUERYResult,
  PROJECT_BY_ID_QUERYResult,
} from "../../sanity.types";
import { checkContactEmailExists } from "@/sanity/lib/clients/getContactByEmail";

interface QuotationProps {
  labTests: (ALL_SERVICES_QUERYResult[number] & {
    price: number;
    quantity: number;
    unit: string;
  })[];
  fieldTests: (ALL_SERVICES_QUERYResult[number] & {
    price: number;
    quantity: number;
    unit: string;
  })[];
  reportingActivities: {
    unit: string;
    activity: string;
    price: number;
    quantity: number;
  }[];
  mobilizationActivities: {
    unit: string;
    activity: string;
    price: number;
    quantity: number;
  }[];
  project: PROJECT_BY_ID_QUERYResult[number];
  currency: string;
  vatPercentage: number;
  paymentNotes: string;
  advance: number;
  quotationNumber: string;
  quotationDate: string;
  acquisitionNumber: string;
  revisionNumber: string;
  subtotal: number;
  grandTotal: number;
}

// CREATE INVOICE
export async function createInvoice(quotationId: string, fileId: string) {
  try {
    const quotation = await writeClient
      .patch(quotationId)
      .set({
        invoice: {
          _type: "file",
          asset: {
            _type: "reference",
            _ref: fileId,
          },
        },
      })
      .commit();

    revalidateTag(`quotation`);
    return { result: quotation, status: "ok" };
  } catch (error) {
    console.error("Error creating invoice:", error);
    return { error, status: "error" };
  }
}

// CREATE QUOTATION
export async function createQuotation(
  billingInfo: QuotationProps,
  fileId: string,
  creatingRevision?: boolean
) {
  try {
    const {
      labTests,
      fieldTests,
      reportingActivities,
      mobilizationActivities,
      project,
      currency,
      vatPercentage,
      paymentNotes,
      advance,
      quotationNumber,
      quotationDate,
      acquisitionNumber,
      revisionNumber,
      subtotal,
      grandTotal,
    } = billingInfo;

    const items = [
      ...labTests.map((test) => {
        const selectedMethodId = test.testMethods?.find(
          (method: any) => method.selected
        )?._id;
        return {
          _type: "serviceItem",
          service: {
            _type: "reference",
            _ref: test._id,
          },
          testMethod: {
            _type: "reference",
            _ref: selectedMethodId,
          },
          unit: test.unit.toLowerCase(),
          unitPrice: test.price,
          quantity: test.quantity,
          lineTotal: test.price * test.quantity,
        };
      }),
      ...fieldTests.map((field) => {
        const selectedMethodId = field.testMethods?.find(
          (method: any) => method.selected
        )?._id;
        return {
          _type: "serviceItem",
          service: {
            _type: "reference",
            _ref: field._id,
          },
          testMethod: {
            _type: "reference",
            _ref: selectedMethodId,
          },
          unit: field.unit.toLowerCase(),
          unitPrice: field.price,
          quantity: field.quantity,
          lineTotal: field.price * field.quantity,
        };
      }),
    ];

    const otherItems = [
      ...reportingActivities.map((reporting) => ({
        _type: "otherItem",
        type: "reporting",
        activity: reporting.activity,
        unit: reporting.unit.toLowerCase(),
        unitPrice: reporting.price,
        quantity: reporting.quantity,
        lineTotal: reporting.price * reporting.quantity,
      })),
      ...mobilizationActivities.map((mobilization) => ({
        _type: "otherItem",
        type: "mobilization",
        activity: mobilization.activity,
        unit: mobilization.unit.toLowerCase(),
        unitPrice: mobilization.price,
        quantity: mobilization.quantity,
        lineTotal: mobilization.price * mobilization.quantity,
      })),
    ];

    const quotationId = `quotation-${uuidv4()}`;

    const tx = writeClient.transaction();

    // create quotation
    tx.create({
      _id: quotationId,
      _type: "quotation",
      revisionNumber,
      quotationNumber,
      quotationDate,
      acquisitionNumber,
      currency: currency.toLowerCase(),
      status: "draft",
      items,
      otherItems,
      vatPercentage,
      paymentNotes,
      advance,
      subtotal,
      grandTotal,
      file: {
        _type: "file",
        asset: {
          _type: "reference",
          _ref: fileId,
        },
      },
    });

    // 2) Optionally set quotation ref on project in the SAME commit
    if (!creatingRevision) {
      tx.patch(project._id, (p) =>
        p.set({
          quotation: { _type: "reference", _ref: quotationId },
        })
      );
    }
    // Single network roundtrip; no document echo
    await tx.commit({
      returnDocuments: false,
      autoGenerateArrayKeys: true,
    });

    // Revalidate both; projects often render quotation info
    revalidateTag("quotation");
    revalidateTag("projects");

    return { result: quotationId, status: "ok" };
  } catch (error) {
    console.error("Error creating quotation:", error);
    return { error, status: "error" };
  }
}

// UPDATE QUOTATION (BEFORE SENDING)
export async function updateQuotation(
  quotationId: string,
  billingInfo: QuotationProps,
  fileId: string
) {
  try {
    const {
      labTests,
      fieldTests,
      reportingActivities,
      mobilizationActivities,
      project,
      currency,
      vatPercentage,
      paymentNotes,
      advance,
      quotationNumber,
      quotationDate,
      acquisitionNumber,
      revisionNumber,
      subtotal,
      grandTotal,
    } = billingInfo;

    const items = [
      ...labTests.map((test) => {
        const selectedMethodId = test.testMethods?.find(
          (method: any) => method.selected
        )?._id;
        return {
          _type: "serviceItem",
          service: {
            _type: "reference",
            _ref: test._id,
          },
          testMethod: {
            _type: "reference",
            _ref: selectedMethodId,
          },
          unit: test.unit.toLowerCase(),
          unitPrice: test.price,
          quantity: test.quantity,
          lineTotal: test.price * test.quantity,
        };
      }),
      ...fieldTests.map((field) => {
        const selectedMethodId = field.testMethods?.find(
          (method: any) => method.selected
        )?._id;
        return {
          _type: "serviceItem",
          service: {
            _type: "reference",
            _ref: field._id,
          },
          testMethod: {
            _type: "reference",
            _ref: selectedMethodId,
          },
          unit: field.unit.toLowerCase(),
          unitPrice: field.price,
          quantity: field.quantity,
          lineTotal: field.price * field.quantity,
        };
      }),
    ];

    const otherItems = [
      ...reportingActivities.map((reporting) => ({
        _type: "otherItem",
        type: "reporting",
        activity: reporting.activity,
        unit: reporting.unit.toLowerCase(),
        unitPrice: reporting.price,
        quantity: reporting.quantity,
        lineTotal: reporting.price * reporting.quantity,
      })),
      ...mobilizationActivities.map((mobilization) => ({
        _type: "otherItem",
        type: "mobilization",
        activity: mobilization.activity,
        unit: mobilization.unit.toLowerCase(),
        unitPrice: mobilization.price,
        quantity: mobilization.quantity,
        lineTotal: mobilization.price * mobilization.quantity,
      })),
    ];

    const tx = writeClient.transaction();

    // If the file is referenced, unlink it from the quotation
    tx.patch(quotationId as string, (p) => p.unset(["file"]));

    // first delete the old pdf file from the quotation
    if (project.quotation?.file?.asset?._id) {
      tx.delete(project.quotation?.file?.asset?._id);
    }

    tx.patch(quotationId as string, (p) =>
      p.set({
        status: "draft",
        revisionNumber,
        quotationNumber,
        quotationDate,
        acquisitionNumber,
        currency: currency.toLowerCase(),
        items,
        otherItems,
        vatPercentage,
        paymentNotes,
        advance,
        subtotal,
        grandTotal,
        file: {
          _type: "file",
          asset: {
            _type: "reference",
            _ref: fileId,
          },
        },
      })
    );

    await tx.commit({ autoGenerateArrayKeys: true });

    revalidateTag(`project-${project._id}`);
    return { result: "ok", status: "ok" };
  } catch (error) {
    console.error("Error sending quotation:", error);
    return { error, status: "error" };
  }
}

// SEND QUOTATION TO CLIENT
export async function sendQuotation(quotationId: string) {
  // TODO: Send email to client
  try {
    await writeClient
      .patch(quotationId as string)
      .set({
        status: "sent",
      })
      .commit();
    revalidateTag("quotation");
    return { result: "ok", status: "ok" };
  } catch (error) {
    console.error("Error sending quotation:", error);
    return { error, status: "error" };
  }
}

// RESPOND TO QUOTATION
export async function respondToQuotation(
  quotationId: string,
  status: "accepted" | "rejected" | "revisions_requested",
  rejectionNotes?: string
) {
  try {
    await writeClient
      .patch(quotationId as string)
      .set({
        status:
          status === "revisions_requested"
            ? "rejected"
            : status === "accepted"
              ? "invoiced"
              : status,
        rejectionNotes,
      })
      .commit();
    revalidateTag("quotation");
    return { result: "ok", status: "ok" };
  } catch (error) {
    console.error("Error responding to quotation:", error);
    return { error, status: "error" };
  }
}

// CREATE REVISION
export async function createRevision(
  billingInfo: QuotationProps,
  fileId: string
) {
  try {
    const { project } = billingInfo;
    const originalQuotationId = project.quotation?._id || "";

    // create revised quotation
    const revision = await createQuotation(billingInfo, fileId, true);

    // Append reference + mark revision "sent" in ONE transaction
    const tx = writeClient.transaction();

    tx.patch(originalQuotationId, (p) =>
      p
        .setIfMissing({ revisions: [] })
        .append("revisions", [{ _type: "reference", _ref: revision?.result }])
    );

    tx.patch(revision?.result || "", (p) => p.set({ status: "sent" }));

    await tx.commit({
      autoGenerateArrayKeys: true,
      returnDocuments: false,
    });

    revalidateTag("quotation");
    return { result: revision?.result, status: "ok" };
  } catch (error) {
    console.error("Error creating revision:", error);
    return { error, status: "error" };
  }
}

// MAKE PAYMENT
export async function makePayment(prevState: any, formData: FormData) {
  const quotationId = formData.get("quotationId");
  const amountRaw = formData.get("amount");
  const currency = formData.get("currency");
  const paymentMode = formData.get("paymentMode");
  const paymentType = formData.get("paymentType");
  const paymentReference = formData.get("reference");
  const paymentProof = formData.get("paymentProof");

  // Validate & coerce
  if (!quotationId) return { status: "error", error: "Missing quotationId" };

  const amount =
    typeof amountRaw === "string"
      ? parseFloat(amountRaw)
      : typeof amountRaw === "number"
        ? amountRaw
        : NaN;

  if (!Number.isFinite(amount))
    return { status: "error", error: "Invalid amount" };

  const paymentModeValue =
    paymentMode === "mobile_money"
      ? "mobile"
      : paymentMode === "bank_transfer"
        ? "bank"
        : "cash";

  try {
    await writeClient
      .patch(quotationId as string)
      .set({
        status: "partially_paid",
      })
      .setIfMissing({ payments: [] })
      .append("payments", [
        {
          paymentType,
          amount,
          paymentMode: paymentModeValue,
          currency,
          paymentProof: {
            _type: "file",
            asset: {
              _type: "reference",
              _ref: paymentProof,
            },
          },
          internalStatus: "pending",
        },
      ])
      .commit({ autoGenerateArrayKeys: true });
    revalidateTag("quotation");
    return { result: "ok", status: "ok" };
  } catch (error) {
    console.error("Error making payment:", error);
    return { error, status: "error" };
  }
}

// MAKE RESUBMISSION
export async function makeResubmission(prevState: any, formData: FormData) {
  const quotationId = formData.get("quotationId");
  const amountRaw = formData.get("amount");
  const paymentMode = formData.get("paymentMode");
  const paymentProof = formData.get("paymentProof");
  const paymentKey = formData.get("paymentKey");

  // Validate & coerce
  if (!quotationId) return { status: "error", error: "Missing quotationId" };

  const amount =
    typeof amountRaw === "string"
      ? parseFloat(amountRaw)
      : typeof amountRaw === "number"
        ? amountRaw
        : NaN;

  if (!Number.isFinite(amount))
    return { status: "error", error: "Invalid amount" };

  const paymentModeValue =
    paymentMode === "mobile_money"
      ? "mobile"
      : paymentMode === "bank_transfer"
        ? "bank"
        : "cash";

  try {
    await writeClient
      .patch(quotationId as string)
      .setIfMissing({ payments: [] })
      .setIfMissing({ [`payments[_key == "${paymentKey}"].resubmissions`]: [] })
      .append(`payments[_key == "${paymentKey}"].resubmissions`, [
        {
          amount,
          paymentMode: paymentModeValue,
          paymentProof: {
            _type: "file",
            asset: { _type: "reference", _ref: paymentProof },
          },
          internalStatus: "pending",
        },
      ])
      .commit({ autoGenerateArrayKeys: true });
    revalidateTag("quotation");
    return { result: "ok", status: "ok" };
  } catch (error) {
    console.error("Error making resubmission:", error);
    return { error, status: "error" };
  }
}

// APPROVE PAYMENT & CREATE RECEIPT
export async function createReceipt(
  quotationId: string,
  fileId: string,
  paymentKey: string,
  resubmissionKey?: string,
  internalNotes?: string
) {
  const paymentPath = resubmissionKey
    ? `payments[_key=="${paymentKey}"].resubmissions[_key=="${resubmissionKey}"]`
    : `payments[_key=="${paymentKey}"]`;
  try {
    // Fetch latest quotation with totals and payments
    const quotation = await writeClient.fetch(
      `*[_id == $id][0]{
        _id,
        grandTotal,
        payments[]{
          _key,
          amount,
          internalStatus,
          resubmissions[]{
            _key,
            amount,
            internalStatus
          }
        }
      }`,
      { id: quotationId }
    );

    const grandTotal: number = Number(quotation?.grandTotal || 0);

    // Compute total approved before current approval
    const totalApprovedBefore: number = (quotation?.payments || []).reduce(
      (sum: number, p: any) => {
        const approvedResubs = (p.resubmissions || []).filter(
          (r: any) => r.internalStatus === "approved"
        );
        const latestApproved =
          approvedResubs.length > 0
            ? approvedResubs[approvedResubs.length - 1]
            : null;
        if (latestApproved) return sum + (Number(latestApproved.amount) || 0);
        if (p.internalStatus === "approved")
          return sum + (Number(p.amount) || 0);
        return sum;
      },
      0
    );

    // Find the amount being approved in this call
    const targetPayment = (quotation?.payments || []).find(
      (p: any) => p._key === paymentKey
    );
    let amountToApprove = 0;
    if (targetPayment) {
      if (resubmissionKey) {
        const resub = (targetPayment.resubmissions || []).find(
          (r: any) => r._key === resubmissionKey
        );
        amountToApprove = Number(resub?.amount || 0);
      } else {
        amountToApprove = Number(targetPayment.amount || 0);
      }
    }

    const totalApprovedAfter = totalApprovedBefore + amountToApprove;
    const epsilon = 0.0001; // currency rounding tolerance
    const shouldMarkFullyPaid =
      grandTotal > 0 && totalApprovedAfter >= grandTotal - epsilon;

    const tx = writeClient.transaction();
    tx.patch(quotationId, (patch: any) =>
      patch.set({
        [`${paymentPath}.receipt`]: {
          _type: "file",
          asset: { _type: "reference", _ref: fileId },
        },
        [`${paymentPath}.internalStatus`]: "approved",
        [`${paymentPath}.internalNotes`]: internalNotes,
        ...(shouldMarkFullyPaid ? { status: "fully_paid" } : {}),
      })
    );

    const result = await tx.commit({ autoGenerateArrayKeys: true });

    revalidateTag(`quotation`);
    return { result, status: "ok" };
  } catch (error) {
    console.error("Error approving payment:", error);
    return { error, status: "error" };
  }
}

export async function rejectPayment(
  quotationId: string,
  paymentKey: string,
  internalNotes: string,
  resubmissionKey?: string
) {
  const paymentPath = resubmissionKey
    ? `payments[_key=="${paymentKey}"].resubmissions[_key=="${resubmissionKey}"]`
    : `payments[_key=="${paymentKey}"]`;

  try {
    const quotation = await writeClient
      .patch(quotationId)
      .set({
        [`${paymentPath}.internalStatus`]: "rejected",
        [`${paymentPath}.internalNotes`]: internalNotes,
      })
      // Optional: if you want to clear a previously generated receipt on rejection
      // .unset([`${paymentPath}.receipt`])
      .commit({ autoGenerateArrayKeys: true });

    revalidateTag("quotation");
    return { result: quotation, status: "ok" };
  } catch (error) {
    console.error("Error rejecting payment:", error);
    return { error, status: "error" };
  }
}

// CREATE CLIENT
export async function createClient(prevState: any, formData: FormData) {
  try {
    const clientName = formData.get("clientName");
    const internalId = formData.get("internalId");

    const client = await writeClient.create({
      _type: "client",
      name: clientName,
      internalId,
    });

    revalidateTag("clients");
    return { result: client, status: "ok" };
  } catch (error) {
    console.error("Error creating client:", error);
    return { error, status: "error" };
  }
}

// CREATE STANDARD
export async function addStandard(prevState: any, formData: FormData) {
  try {
    const name = formData.get("name");
    const acronym = formData.get("acronym");
    const description = formData.get("description");

    const standard = await writeClient.create(
      {
        _type: "standard",
        name,
        acronym,
        description,
      },
      {
        autoGenerateArrayKeys: true,
      }
    );
    revalidateTag("standards");
    return { result: standard, status: "ok" };
  } catch (error) {
    console.error("Error adding standard:", error);
    return { error, status: "error" };
  }
}

// DELETE STANDARD
export async function deleteStandard(standardId: string) {
  try {
    const result = await writeClient.delete(standardId);
    revalidateTag("standards");
    return { result, status: "ok" };
  } catch (error) {
    console.error("Error deleting standard:", error);
    return { error, status: "error" };
  }
}

// DELETE MULTIPLE STANDARDS
export async function deleteMultipleStandards(standardIds: string[]) {
  try {
    const results = await Promise.all(
      standardIds.map(async (standardId) => {
        const result = await writeClient.delete(standardId);
        return result;
      })
    );
    revalidateTag("standards");
    return { results, status: "ok" };
  } catch (error) {
    console.error("Error deleting standards:", error);
    return { error, status: "error" };
  }
}

// UPDATE STANDARD
export async function updateStandard(prevState: any, formData: FormData) {
  try {
    const standardId = formData.get("standardId");
    const name = formData.get("name");
    const acronym = formData.get("acronym");
    const description = formData.get("description");

    const result = await writeClient
      .patch(standardId as string)
      .set({ name, acronym, description })
      .commit();
    revalidateTag("standards");
    return { result, status: "ok" };
  } catch (error) {
    console.error("Error updating standard:", error);
    return { error, status: "error" };
  }
}

// ADD TEST METHOD
export async function addTestMethod(prevState: any, formData: FormData) {
  try {
    const code = formData.get("code") as string;
    const description = formData.get("description") as string;
    const standardId = formData.get("standard") as string;
    const fileIds = formData.getAll("documents") as string[];

    // Create the testMethod document
    const testMethod = await writeClient.create(
      {
        _type: "testMethod",
        code,
        description,
        standard: {
          _type: "reference",
          _ref: standardId,
        },
        documents: fileIds.map((fileId) => ({
          _type: "file",
          asset: {
            _type: "reference",
            _ref: fileId,
          },
        })),
      },
      {
        autoGenerateArrayKeys: true,
      }
    );

    return { result: testMethod, status: "ok" };
  } catch (error) {
    console.error("Error adding test method:", error);
    return { error, status: "error" };
  }
}

// UPDATE TEST METHOD
export async function updateTestMethod(prevState: any, formData: FormData) {
  const code = formData.get("code");
  const description = formData.get("description");
  const standardId = formData.get("standard");
  const testMethodId = formData.get("testMethodId");
  try {
    const result = await writeClient
      .patch(testMethodId as string)
      .set({
        code,
        description,
        standard: { _type: "reference", _ref: standardId },
      })
      .commit();
    revalidateTag("testMethods");
    return { result, status: "ok" };
  } catch (error) {
    console.error("Error updating test method:", error);
    return { error, status: "error" };
  }
}

// DELETE TEST METHOD
export async function deleteTestMethod(testMethodId: string) {
  try {
    // 1. Fetch asset IDs before deleting the document
    const method = await writeClient.fetch(
      `*[_type == "testMethod" && _id == $id][0] {
        documents[]{
          asset->{
            _id
          }
        }
      }`,
      { id: testMethodId }
    );

    const assetIds: string[] = method?.documents
      ?.map((doc: any) => doc.asset?._id)
      .filter(Boolean);

    // 2. Delete the testMethod document first
    const result = await writeClient.delete(testMethodId);

    // 3. Then check and delete unreferenced assets
    if (assetIds?.length) {
      await Promise.all(
        assetIds.map(async (assetId) => {
          const refCount = await writeClient.fetch(
            `count(*[references($assetId)])`,
            { assetId }
          );

          if (refCount === 0) {
            await writeClient.delete(assetId);
          }
        })
      );
    }

    // 4. Revalidate cache
    revalidateTag("testMethods");

    return { result, status: "ok" };
  } catch (error) {
    console.error("Error deleting test method:", error);
    return { error, status: "error" };
  }
}

// GET TEST METHODS REFERENCING FILE
export async function getTestMethodsReferencingFile(fileId: string) {
  return await writeClient.fetch(
    `*[_type == "testMethod" && references($id)] {
      _id,
      _type,
      code,
      testParameter
    }`,
    { id: fileId }
  );
}

// GET DOCUMENTS REFERENCING TEST METHOD
export async function getDocumentsReferencingTestMethod(testMethodId: string) {
  return await writeClient.fetch(
    `*[_type != "testMethod" && references($id)] {
      _id,
      _type,
      code,
      testParameter
    }`,
    { id: testMethodId }
  );
}

// GET DOCUMENTS REFERENCING MULTIPLE TEST METHODS
export async function getDocumentsReferencingMultipleTestMethods(
  testMethodIds: string[]
) {
  const results = await Promise.all(
    testMethodIds.map(async (id) => {
      const documents = await writeClient.fetch(
        `*[_type != "testMethod" && references($id)] {
          _id,
          _type,
          code,
          testParameter
        }`,
        { id }
      );
      return { testMethodId: id, documents }; // Return an object with the testMethodId and its documents
    })
  );
  return results; // Return the array of objects
}

// DELETE MULTIPLE TEST METHODS
export async function deleteMultipleTestMethods(testMethodIds: string[]) {
  try {
    const results = await Promise.all(
      testMethodIds.map(async (testMethodId) => {
        const documents = await getDocumentsReferencingTestMethod(testMethodId);

        if (documents.length === 0) {
          // 1. Fetch asset IDs before deleting the document
          const method = await writeClient.fetch(
            `*[_type == "testMethod" && _id == $id][0] {
            documents[]{
              asset->{
                _id
              }
            }
          }`,
            { id: testMethodId }
          );

          const assetIds: string[] = method?.documents
            ?.map((doc: any) => doc.asset?._id)
            .filter(Boolean);

          // 2. Delete the testMethod document first
          const result = await writeClient.delete(testMethodId);

          // 3. Then check and delete unreferenced assets
          if (assetIds?.length) {
            await Promise.all(
              assetIds.map(async (assetId) => {
                const refCount = await writeClient.fetch(
                  `count(*[references($assetId)])`,
                  {
                    assetId,
                  }
                );

                if (refCount === 0) {
                  await writeClient.delete(assetId);
                }
              })
            );
          }

          return { result, deleted: true }; // Indicate that a test method was deleted
        }
        return { deleted: false }; // Indicate that no test method was deleted
      })
    );

    const anyDeleted = results.some((res) => res.deleted);
    revalidateTag("testMethods");
    return {
      results,
      status: anyDeleted ? "ok" : "no_deletions",
      deletedItems: results.filter((res) => res.deleted).length,
    }; // Return different status if no deletions occurred
  } catch (error) {
    console.error("Error deleting test methods:", error);
    return { error, status: "error" };
  }
}

// REMOVE TEST METHOD FROM SERVICE
export async function deleteTestMethodFromService(
  serviceId: string,
  testMethodId: string
) {
  try {
    const result = await writeClient
      .patch(serviceId)
      .unset([`testMethods[_ref == "${testMethodId}"]`])
      .commit();
    return { result, status: "ok" };
  } catch (error) {
    console.error("Error deleting test method:", error);
    return { error, status: "error" };
  }
}

// DELETE MULTIPLE TEST METHODS FROM SERVICE
export async function deleteMultipleTestMethodsFromService(
  serviceId: string,
  testMethodIds: string[]
) {
  try {
    const results = await Promise.all(
      testMethodIds.map(async (testMethodId) => {
        const result = await writeClient
          .patch(serviceId)
          .unset([`testMethods[_ref == "${testMethodId}"]`])
          .commit();
        return result;
      })
    );
    revalidateTag("testMethods");
    return { results, status: "ok" };
  } catch (error) {
    console.error("Error deleting test methods:", error);
    return { error, status: "error" };
  }
}

// ADD FILES TO TEST METHOD
export async function addFilesToTestMethod(prevState: any, formData: FormData) {
  const testMethodId = formData.get("testMethodId") as string;
  const fileIds = formData.getAll("documents") as string[];

  try {
    const files = fileIds.map((fileId) => ({
      _type: "file",
      asset: {
        _type: "reference",
        _ref: fileId,
      },
    }));

    const result = await writeClient
      .patch(testMethodId)
      .append("documents", files)
      .commit({ autoGenerateArrayKeys: true });

    return { result, status: "success" };
  } catch (error) {
    console.error("Error adding files to test method:", error);
    return { error, status: "error" };
  }
}

// DELETE FILE
export async function deleteFileFromTestMethod(
  fileId: string,
  fileKey: string,
  currentTestMethodId: string
) {
  try {
    // Check if the file is referenced by any test method other than the current one
    const documents = await writeClient.fetch(
      `*[_type == "testMethod" && references($fileId) && _id != $currentId] {
        _id,
        _type,
        code,
        testParameter
      }`,
      { fileId, currentId: currentTestMethodId }
    );

    if (documents.length > 0) {
      // If the file is referenced by other test methods, unlink it from the current test method
      const result = await writeClient
        .patch(currentTestMethodId)
        .unset([`documents[_key == "${fileKey}"]`])
        .commit();

      console.log(result);
      revalidateTag("testMethods");
      return { result, status: "ok" };
    } else {
      await writeClient
        .patch(currentTestMethodId)
        .unset([`documents[_key == "${fileKey}"]`])
        .commit();
      const result = await writeClient.delete(fileId);
      revalidateTag("testMethods");
      return { result, status: "ok" };
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    return { error, status: "error" };
  }
}

// ADD SAMPLE CLASS
export async function addSampleClass(prevState: any, formData: FormData) {
  const name = formData.get("name");
  const description = formData.get("description");
  const subclassesRaw = formData.get("subclasses");

  let subclasses = [];
  try {
    subclasses = JSON.parse(subclassesRaw as string);
  } catch (e) {
    return { status: "error", message: "Invalid subclasses data" };
  }

  try {
    const result = await writeClient.create(
      {
        _type: "sampleClass",
        name,
        description,
        subclasses: subclasses.map((sc: { name: string; key: string }) => ({
          _type: "subclass",
          name: sc.name,
          key: sc.key,
        })),
      },
      {
        autoGenerateArrayKeys: true,
      }
    );
    return { result, status: "ok" };
  } catch (error) {
    console.error("Error adding sample class:", error);
    return { error, status: "error" };
  }
}

// DELETE SAMPLE CLASS
export async function deleteSampleClass(sampleClassId: string) {
  try {
    const result = await writeClient.delete(sampleClassId);
    revalidateTag("sampleClasses");
    return { result, status: "ok" };
  } catch (error) {
    console.error("Error deleting sample class:", error);
    return { error, status: "error" };
  }
}

// DELETE MULTIPLE SAMPLE CLASSES
export async function deleteMultipleSampleClasses(sampleClassIds: string[]) {
  try {
    const results = await Promise.all(
      sampleClassIds.map(async (sampleClassId) => {
        const documents =
          await getDocumentsReferencingSampleClass(sampleClassId);
        if (documents.length === 0) {
          const result = await writeClient.delete(sampleClassId);
          return { result, deleted: true };
        }
        return { deleted: false };
      })
    );

    const anyDeleted = results.some((res) => res.deleted);
    revalidateTag("sampleClasses");
    return {
      results,
      status: anyDeleted ? "ok" : "no_deletions",
      deletedItems: results.filter((res) => res.deleted).length,
    };
  } catch (error) {
    console.error("Error deleting sample classes:", error);
    return { error, status: "error" };
  }
}

// GET DOCUMENTS REFERENCING SAMPLE CLASS
export async function getDocumentsReferencingSampleClass(
  sampleClassId: string
) {
  return await writeClient.fetch(
    `*[_type != "sampleClass" && references($id)] {
      _id,
      _type,
      code,
      testParameter
    }`,
    { id: sampleClassId }
  );
}

// GET DOCUMENTS REFERENCING MULTIPLE SAMPLE CLASSES
export async function getDocumentsReferencingMultipleSampleClasses(
  sampleClassIds: string[]
) {
  const results = await Promise.all(
    sampleClassIds.map(async (id) => {
      const documents = await writeClient.fetch(
        `*[_type != "sampleClass" && references($id)] {
          _id,
          _type,
          code,
          testParameter
        }`,
        { id }
      );
      return { sampleClassId: id, documents }; // Return an object with the testMethodId and its documents
    })
  );
  return results; // Return the array of objects
}

// UPDATE SAMPLE CLASS
export async function updateSampleClass(prevState: any, formData: FormData) {
  const name = formData.get("name");
  const description = formData.get("description");
  const subclassesRaw = formData.get("subclasses");
  const sampleClassId = formData.get("sampleClassId");
  let subclasses = [];
  try {
    subclasses = JSON.parse(subclassesRaw as string);
  } catch (e) {
    return { status: "error", message: "Invalid subclasses data" };
  }
  try {
    const result = await writeClient
      .patch(sampleClassId as string)
      .set({ name, description, subclasses })
      .commit();
    revalidateTag("sampleClasses");
    return { result, status: "ok" };
  } catch (error) {
    console.error("Error updating sample class:", error);
    return { error, status: "error" };
  }
}

// ADD SERVICE
export async function addService(prevState: any, formData: FormData) {
  const code = formData.get("code");
  const testParameter = formData.get("testParameter");
  const testMethods = formData
    .getAll("testMethods")
    .map((testMethod) => JSON.parse(testMethod as string));
  const sampleClass = formData.get("sampleClass");
  const status = formData.get("status");

  try {
    const result = await writeClient.create(
      {
        _type: "service",
        code,
        testParameter,
        testMethods: testMethods.map((m) => ({
          _type: "reference",
          _ref: m.testMethod,
        })),
        sampleClass: {
          _type: "reference",
          _ref: sampleClass,
        },
        status,
      },
      {
        autoGenerateArrayKeys: true,
      }
    );
    revalidateTag("services");
    return { result, status: "ok" };
  } catch (error) {
    console.error("Error adding service:", error);
    return { error, status: "error" };
  }
}

// UPDATE SERVICE
export async function updateService(prevState: any, formData: FormData) {
  const code = formData.get("code");
  const testParameter = formData.get("testParameter");
  const testMethods = formData
    .getAll("testMethods")
    .map((testMethod) => JSON.parse(testMethod as string));
  const sampleClass = formData.get("sampleClass");
  const status = formData.get("status");
  const serviceId = formData.get("serviceId");
  try {
    const result = await writeClient
      .patch(serviceId as string)
      .set({
        code,
        testParameter,
        testMethods: testMethods.map((m) => ({
          _type: "reference",
          _ref: m.testMethod,
        })),
        sampleClass: {
          _type: "reference",
          _ref: sampleClass,
        },
        status,
      })
      .commit();
    revalidateTag("services");
    revalidateTag(`service-${serviceId}`);
    return { result, status: "ok" };
  } catch (error) {
    console.error("Error updating service:", error);
    return { error, status: "error" };
  }
}

// DELETE SERVICE
export async function deleteService(serviceId: string) {
  try {
    const result = await writeClient.delete(serviceId);
    revalidateTag("services");
    return { result, status: "ok" };
  } catch (error) {
    console.error("Error deleting service:", error);
    return { error, status: "error" };
  }
}

// DELETE MULTIPLE SERVICES
export async function deleteMultipleServices(serviceIds: string[]) {
  try {
    const results = await Promise.all(
      serviceIds.map(async (serviceId) => {
        const result = await writeClient.delete(serviceId);
        return result;
      })
    );
    revalidateTag("services");
    return { results, status: "ok" };
  } catch (error) {
    console.error("Error deleting services:", error);
    return { error, status: "error" };
  }
}

// ACTIVATE DEACTIVATE SERVICE
export async function activateDeactivateService(
  prevState: any,
  formData: FormData
) {
  const serviceId = formData.get("serviceId");
  const status = formData.get("status");
  try {
    const result = await writeClient
      .patch(serviceId as string)
      .set({ status: status as string })
      .commit();
    revalidateTag("services");
    return { result, status: "ok" };
  } catch (error) {
    console.error("Error activating/deactivating service:", error);
    return { error, status: "error" };
  }
}

// UPLOAD PDF DOCUMENT
export async function uploadPDFDocument(pdfBlob: Blob, filename: string) {
  try {
    // Upload PDF to Sanity
    const document = await writeClient.assets.upload("file", pdfBlob, {
      filename,
      contentType: "application/pdf",
    });

    console.log("PDF uploaded:", document);
    return { result: document, status: "ok" };
  } catch (error) {
    console.error("Error uploading PDF:", error);
    return { error, status: "error" };
  }
}

export async function deleteAsset() {
  try {
    const asset = await writeClient.delete(
      "file-02b0d0933047999d4815962463e31219ca1adc6a-pdf"
    );
    console.log("Asset deleted:", asset);
    return { result: asset, status: "ok" };
  } catch (error) {
    console.error("Error deleting asset:", error);
    return { error, status: "error" };
  }
}

export async function setProjectDateRange(prevState: any, formData: FormData) {
  try {
    const dateFrom = formData.get("dateFrom");
    const dateTo = formData.get("dateTo");
    const projectId = formData.get("projectId");

    const result = await writeClient
      .patch(projectId as string)
      .set({
        startDate: (dateFrom as string) || null,
        endDate: (dateTo as string) || null,
      })
      .commit();
    revalidateTag(`project-${projectId}`);
    return { result: result, status: "ok" };
  } catch (error) {
    console.error("Error setting date-range:", error);
    return { error, status: "error" };
  }
}

export async function createProject(prevState: any, formData: FormData) {
  try {
    const internalId = formData.get("internalId");
    const projectName = formData.get("projectName");
    const dateFrom = formData.get("dateFrom");
    const dateTo = formData.get("dateTo");
    const clients = formData
      .getAll("clients")
      .map((client) => JSON.parse(client as string));

    const clientIds = await Promise.all(
      clients.map(async (client) => {
        if (client.clientType === "new") {
          // Create the new client
          const newClient = await writeClient.create({
            _type: "client",
            name: client.newClientName,
            internalId: client.newClientInternalId,
          });
          return newClient._id; // Return the new client's ID
        } else {
          // Use existing client ID
          return client.existingClient;
        }
      })
    );

    // Create the project
    const project = await writeClient.create(
      {
        _type: "project",
        internalId,
        name: projectName,
        startDate: dateFrom || null,
        endDate: dateTo || null,
        stagesCompleted: [], // Placeholder logic
        clients: clientIds.map((clientId) => ({
          _type: "reference",
          _ref: clientId,
        })), // Reference clients
      },
      {
        autoGenerateArrayKeys: true,
      }
    );
    revalidateTag("projects");
    return { result: project, status: "ok" };
  } catch (error) {
    return { error, status: "error" };
  }
}

export async function createProjectForClient(
  prevState: any,
  formData: FormData
) {
  try {
    const internalId = formData.get("internalId");
    const projectName = formData.get("projectName");
    const dateFrom = formData.get("dateFrom");
    const dateTo = formData.get("dateTo");
    const clientId = formData.get("clientId");

    console.log(clientId);

    // Create the project
    const project = await writeClient.create(
      {
        _type: "project",
        internalId,
        name: projectName,
        startDate: dateFrom || null,
        endDate: dateTo || null,
        stagesCompleted: [], // Placeholder logic
        clients: [
          {
            _type: "reference",
            _ref: clientId,
          },
        ],
      },
      {
        autoGenerateArrayKeys: true,
      }
    );

    revalidateTag(`client-${clientId}`);
    return { result: project, status: "ok" };
  } catch (error) {
    return { error, status: "error" };
  }
}

export async function updateProjectName(
  formData: FormData,
  projectId?: string
) {
  try {
    const name = formData.get("name");
    const result = await writeClient
      .patch(projectId as string)
      .set({ name: name as string })
      .commit();
    if (projectId) {
      revalidateTag(`project-${projectId}`);
    }
    return { result, status: "ok" };
  } catch (error) {
    return { error, status: "error" };
  }
}

export async function updateProjectDates(
  formData: FormData,
  projectId?: string
) {
  try {
    const dateFrom = formData.get("dateFrom");
    const dateTo = formData.get("dateTo");

    const result = await writeClient
      .patch(projectId as string)
      .set({ startDate: dateFrom, endDate: dateTo })
      .commit();
    if (projectId) {
      revalidateTag(`project-${projectId}`);
    }
    return { result, status: "ok" };
  } catch (error) {
    return { error, status: "error" };
  }
}

export async function updateClientName(
  clientId: string,
  formData: FormData,
  projectId?: string
) {
  try {
    const clientName = formData.get("clientName");
    console.log(clientName);
    const result = await writeClient
      .patch(clientId as string)
      .set({ name: clientName as string })
      .commit();
    if (projectId) {
      revalidateTag(`project-${projectId}`);
    }
    revalidateTag(`client-${clientId}`);
    return { result, status: "ok" };
  } catch (error) {
    return { error, status: "error" };
  }
}

export async function updateContactPerson(
  contactId: string,
  formData: FormData
) {
  try {
    const name = formData.get("name");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const designation = formData.get("designation");
    const result = await writeClient
      .patch(contactId)
      .set({
        name,
        email,
        phone: sanitizePhoneNumber(phone as string),
        designation,
      })
      .commit();
    revalidateTag("contactPerson");
    return { result, status: "ok" };
  } catch (error) {
    return { error, status: "error" };
  }
}

// CREATE CONTACT PERSON
export async function createContactPerson(prevState: any, formData: FormData) {
  try {
    const name = formData.get("name");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const designation = formData.get("designation");
    const clientId = formData.get("clientId");

    // Check if contact with this email already exists for this specific client
    const existingContact = await checkContactEmailExists(
      email as string,
      clientId as string
    );

    if (existingContact) {
      return {
        error: `A contact with email ${email} already exists for this client`,
        status: "error",
      };
    }

    const result = await writeClient.create({
      _type: "contactPerson",
      name,
      email,
      phone: sanitizePhoneNumber(phone as string),
      designation,
      client: {
        _type: "reference",
        _ref: clientId,
      },
    });
    revalidateTag("contactPerson");
    return { result, status: "ok" };
  } catch (error) {
    return { error, status: "error" };
  }
}

// DELETE CONTACT PERSON
export async function deleteContactPerson(contactId: string) {
  try {
    const result = await writeClient.delete(contactId);
    revalidateTag("contactPerson");
    return { result, status: "ok" };
  } catch (error) {
    return { error, status: "error" };
  }
}

// DELETE MULTIPLE CONTACT PERSONS
export async function deleteMultipleContacts(contactIds: string[]) {
  try {
    const results = await Promise.all(
      contactIds.map(async (contactId) => await writeClient.delete(contactId))
    );
    revalidateTag("contactPerson");
    return { results, status: "ok" };
  } catch (error) {
    return { error, status: "error" };
  }
}

export async function removeContactFromProject(
  contactId: string,
  projectId: string
) {
  try {
    const result = await writeClient
      .patch(projectId)
      .unset([`contactPersons[_ref == "${contactId}"]`])
      .commit();
    // TODO: Possible bug, no tag is specified but revalidateTag seems to update cache
    revalidateTag(`project-${projectId}`);
    return { result, status: "ok" };
  } catch (error) {
    return { error, status: "error" };
  }
}

export async function removeClientFromProject(
  clientId: string,
  projectId: string
) {
  try {
    const result = await writeClient
      .patch(projectId)
      .unset([`clients[_ref == "${clientId}"]`])
      .commit();
    // TODO: Possible bug, no tag is specified but revalidateTag seems to update cache
    revalidateTag(`project-${projectId}`);
    return { result, status: "ok" };
  } catch (error) {
    return { error, status: "error" };
  }
}

// DELETE CLIENT
export async function deleteClient(clientId: string) {
  try {
    // delete all contact persons for the client
    const contactPersons = await writeClient.fetch(
      `*[_type == "contactPerson" && client._ref == "${clientId}"]`
    );

    const contactPersonIds = contactPersons.map(
      (contactPerson: any) => contactPerson._id
    );

    await deleteMultipleContacts(contactPersonIds);

    const result = await writeClient.delete(clientId);
    revalidateTag("clients");
    return {
      result,
      status: "ok",
    };
  } catch (error) {
    console.log(error);
    return { error, status: "error" };
  }
}

// utility: push unique strings only
const push = (arr: string[], v?: string | null) => {
  if (v) arr.push(v);
};

export async function deleteProject(
  project: PROJECT_BY_ID_QUERYResult[number]
) {
  const projectId = project._id;
  const quotation = project.quotation;
  const tx = writeClient.transaction();

  try {
    // 1) Unset quotation ref from the project (so we can delete the quotation doc safely)
    if (quotation?._id) {
      tx.patch(projectId, (p) => p.unset(["quotation"]));
    }

    // 2) Collect per-doc unsets for revisions and payments, then deletions
    const assetIdsToDelete: string[] = [];
    const docIdsToDelete: string[] = [];

    // Handle quotation revisions
    const revisions = quotation?.revisions ?? [];
    for (const rev of revisions) {
      const unsetPaths: string[] = [];

      // revision file & invoice
      if (rev?.file?.asset?._id) {
        unsetPaths.push("file");
        push(assetIdsToDelete, rev.file.asset._id);
      }
      if (rev?.invoice?.asset?._id) {
        unsetPaths.push("invoice");
        push(assetIdsToDelete, rev.invoice.asset._id);
      }

      // payments: proof + receipt paths
      for (const pay of rev?.payments ?? []) {
        const key = pay?._key;
        if (!key) continue;
        if (pay?.paymentProof?.asset?._id) {
          unsetPaths.push(`payments[_key == "${key}"].paymentProof`);
          push(assetIdsToDelete, pay.paymentProof.asset._id);
        }
        if (pay?.internalStatus === "approved" && pay?.receipt?.asset?._id) {
          unsetPaths.push(`payments[_key == "${key}"].receipt`);
          push(assetIdsToDelete, pay.receipt.asset._id);
        }

        // resubmissions: proof + receipt paths
        for (const resub of pay?.resubmissions ?? []) {
          const rkey = resub?._key;
          if (!rkey) continue;
          if (resub?.paymentProof?.asset?._id) {
            unsetPaths.push(
              `payments[_key == "${key}"].resubmissions[_key == "${rkey}"].paymentProof`
            );
            push(assetIdsToDelete, resub.paymentProof.asset._id);
          }
          if (
            resub?.internalStatus === "approved" &&
            resub?.receipt?.asset?._id
          ) {
            unsetPaths.push(
              `payments[_key == "${key}"].resubmissions[_key == "${rkey}"].receipt`
            );
            push(assetIdsToDelete, resub.receipt.asset._id);
          }
        }
      }

      // Apply a single patch for this revision
      if (unsetPaths.length) {
        tx.patch(rev._id, (p) => p.unset(unsetPaths));
      }

      // Also drop the back-ref in the quotation's revisions array in ONE patch later
      // We'll gather all revision refs to unset at once
    }

    // 3) Quotation-level unsets in a single patch
    if (quotation?._id) {
      const qUnsetPaths: string[] = [];

      if (quotation?.file?.asset?._id) {
        qUnsetPaths.push("file");
        push(assetIdsToDelete, quotation.file.asset._id);
      }
      if (quotation?.invoice?.asset?._id) {
        qUnsetPaths.push("invoice");
        push(assetIdsToDelete, quotation.invoice.asset._id);
      }

      for (const pay of quotation?.payments ?? []) {
        const key = pay?._key;
        if (!key) continue;
        if (pay?.paymentProof?.asset?._id) {
          qUnsetPaths.push(`payments[_key == "${key}"].paymentProof`);
          push(assetIdsToDelete, pay.paymentProof.asset._id);
        }
        if (pay?.internalStatus === "approved" && pay?.receipt?.asset?._id) {
          qUnsetPaths.push(`payments[_key == "${key}"].receipt`);
          push(assetIdsToDelete, pay.receipt.asset._id);
        }

        // resubmissions: proof + receipt paths
        for (const resub of pay?.resubmissions ?? []) {
          const rkey = resub?._key;
          if (!rkey) continue;
          if (resub?.paymentProof?.asset?._id) {
            qUnsetPaths.push(
              `payments[_key == "${key}"].resubmissions[_key == "${rkey}"].paymentProof`
            );
            push(assetIdsToDelete, resub.paymentProof.asset._id);
          }
          if (
            resub?.internalStatus === "approved" &&
            resub?.receipt?.asset?._id
          ) {
            qUnsetPaths.push(
              `payments[_key == "${key}"].resubmissions[_key == "${rkey}"].receipt`
            );
            push(assetIdsToDelete, resub.receipt.asset._id);
          }
        }
      }

      // unset all revision refs from the quotation in one shot
      const revRefs = (quotation?.revisions ?? [])
        .map((r) => r?._id)
        .filter(Boolean);
      for (const id of revRefs) {
        qUnsetPaths.push(`revisions[_ref == "${id}"]`);
      }

      if (qUnsetPaths.length) {
        tx.patch(quotation._id, (p) => p.unset(qUnsetPaths));
      }
    }

    // 4) Deletes — assets first (now safe), then revision docs, then quotation, then project
    // assets
    for (const assetId of new Set(assetIdsToDelete)) {
      tx.delete(assetId);
    }
    // revision docs
    for (const rev of revisions) {
      if (rev?._id) tx.delete(rev._id);
    }
    // quotation doc
    if (quotation?._id) {
      tx.delete(quotation._id);
    }
    // project doc
    tx.delete(projectId);

    const result = await tx.commit({ returnDocuments: false });

    revalidateTag("projects");
    return { result, status: "ok" };
  } catch (error) {
    console.log(error);
    return { error, status: "error" };
  }
}

// CREATE PERSONNEL
export async function createPersonnel(prevState: any, formData: FormData) {
  try {
    const internalId = formData.get("internalId");
    const fullName = formData.get("fullName");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const rawDepartmentRoles = formData.get("departmentRoles");
    const departmentRoles = JSON.parse(rawDepartmentRoles as string);

    const departmentRolesArray = departmentRoles.map(
      (role: { department: string; departmentId: string; role: string }) => ({
        _type: "object",
        department: { _type: "reference", _ref: role.departmentId },
        role: role.role,
      })
    );

    const result = await writeClient.create(
      {
        _type: "personnel",
        internalId,
        fullName,
        email,
        phone: sanitizePhoneNumber(phone as string),
        departmentRoles: departmentRolesArray,
        status: "active",
      },
      {
        autoGenerateArrayKeys: true,
      }
    );
    revalidateTag("personnel");
    return { result, status: "ok" };
  } catch (error) {
    return { error, status: "error" };
  }
}

// UPDATE PERSONNEL
export async function updatePersonnel(prevState: any, formData: FormData) {
  try {
    const personnelId = formData.get("personnelId");
    const internalId = formData.get("internalId");
    const fullName = formData.get("fullName");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const rawDepartmentRoles = formData.get("departmentRoles");
    const departmentRoles = JSON.parse(rawDepartmentRoles as string);
    const departmentRolesArray = departmentRoles.map(
      (role: { department: string; departmentId: string; role: string }) => ({
        _type: "object",
        department: { _type: "reference", _ref: role.departmentId },
        role: role.role,
      })
    );

    const result = await writeClient
      .patch(personnelId as string)
      .set({
        internalId,
        fullName,
        email,
        phone: sanitizePhoneNumber(phone as string),
        departmentRoles: departmentRolesArray,
        status: "active",
      })
      .commit({
        autoGenerateArrayKeys: true,
      });

    revalidateTag("personnel");
    return { result, status: "ok" };
  } catch (error) {
    console.log(error);
    return { error, status: "error" };
  }
}

// DELETE PERSONNEL
export async function deletePersonnel(personnelId: string) {
  try {
    const result = await writeClient.delete(personnelId);
    revalidateTag("personnel");
    return { result, status: "ok" };
  } catch (error) {
    return { error, status: "error" };
  }
}

export async function revalidateProject(projectId: string) {
  revalidateTag(`project-${projectId}`);
}

export async function revalidateAll() {
  revalidatePath("/");
  redirect("/");
}
