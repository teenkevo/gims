"use server";
import { writeClient } from "@/sanity/lib/write-client";
import { revalidatePath, revalidateTag } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { sanitizePhoneNumber } from "./utils";
import { v4 as uuidv4 } from "uuid";
import {
  ALL_SERVICES_QUERY_RESULT,
  PROJECT_BY_ID_QUERY_RESULT,
  ALL_RFIS_QUERY_RESULT,
} from "../../sanity.types";
import { checkContactEmailExists } from "@/sanity/lib/clients/getContactByEmail";
import { getPersonnelByEmail } from "@/sanity/lib/personnel/getPersonnelByEmail";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { requirePermissionOrError } from "@/lib/auth/with-auth";
import { getSession } from "@/lib/auth/session";
import { requireQuotationProjectAccessOrError } from "@/lib/auth/project-scope";

interface QuotationProps {
  labTests: (ALL_SERVICES_QUERY_RESULT[number] & {
    price: number;
    quantity: number;
    unit: string;
  })[];
  fieldTests: (ALL_SERVICES_QUERY_RESULT[number] & {
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
  project: PROJECT_BY_ID_QUERY_RESULT[number];
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
  const denied = await requirePermissionOrError(PERMISSIONS["billing:respond"]);
  if (denied) return denied;

  const session = await getSession();
  if (session.isAuthenticated) {
    const scopeDenied = await requireQuotationProjectAccessOrError(
      session,
      quotationId
    );
    if (scopeDenied) return scopeDenied;
  }

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
  const denied = await requirePermissionOrError(PERMISSIONS["billing:create"]);
  if (denied) return denied;

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
  const denied = await requirePermissionOrError(PERMISSIONS["billing:update"]);
  if (denied) return denied;

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
  const denied = await requirePermissionOrError(PERMISSIONS["billing:update"]);
  if (denied) return denied;

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
  const denied = await requirePermissionOrError(PERMISSIONS["billing:respond"]);
  if (denied) return denied;

  const session = await getSession();
  if (session.isAuthenticated) {
    const scopeDenied = await requireQuotationProjectAccessOrError(
      session,
      quotationId
    );
    if (scopeDenied) return scopeDenied;
  }

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
  const denied = await requirePermissionOrError(PERMISSIONS["billing:create"]);
  if (denied) return denied;

  try {
    const { project } = billingInfo;
    const originalQuotationId = project.quotation?._id || "";

    // create revised quotation
    const revision = await createQuotation(billingInfo, fileId, true);
    if (revision.status !== "ok" || !revision.result) {
      return revision.status === "error"
        ? revision
        : { status: "error", error: "Failed to create revision" };
    }

    const revisionId = revision.result;

    // Append reference + mark revision "sent" in ONE transaction
    const tx = writeClient.transaction();

    tx.patch(originalQuotationId, (p) =>
      p
        .setIfMissing({ revisions: [] })
        .append("revisions", [{ _type: "reference", _ref: revisionId }])
    );

    tx.patch(revisionId, (p) => p.set({ status: "sent" }));

    await tx.commit({
      autoGenerateArrayKeys: true,
      returnDocuments: false,
    });

    revalidateTag("quotation");
    return { result: revisionId, status: "ok" };
  } catch (error) {
    console.error("Error creating revision:", error);
    return { error, status: "error" };
  }
}

// MAKE PAYMENT
export async function makePayment(prevState: any, formData: FormData) {
  const denied = await requirePermissionOrError(PERMISSIONS["billing:pay"]);
  if (denied) return denied;

  const quotationId = formData.get("quotationId");
  const amountRaw = formData.get("amount");
  const currency = formData.get("currency");
  const paymentMode = formData.get("paymentMode");
  const paymentType = formData.get("paymentType");
  const paymentReference = formData.get("reference");
  const paymentProof = formData.get("paymentProof");

  // Validate & coerce
  if (!quotationId) return { status: "error", error: "Missing quotationId" };

  const session = await getSession();
  if (session.isAuthenticated) {
    const scopeDenied = await requireQuotationProjectAccessOrError(
      session,
      quotationId as string
    );
    if (scopeDenied) return scopeDenied;
  }

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
          paymentTime: new Date().toISOString(),
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
  const denied = await requirePermissionOrError(PERMISSIONS["billing:pay"]);
  if (denied) return denied;

  const quotationId = formData.get("quotationId");
  const amountRaw = formData.get("amount");
  const paymentMode = formData.get("paymentMode");
  const paymentProof = formData.get("paymentProof");
  const paymentKey = formData.get("paymentKey");

  // Validate & coerce
  if (!quotationId) return { status: "error", error: "Missing quotationId" };

  const resubmissionSession = await getSession();
  if (resubmissionSession.isAuthenticated) {
    const scopeDenied = await requireQuotationProjectAccessOrError(
      resubmissionSession,
      quotationId as string
    );
    if (scopeDenied) return scopeDenied;
  }

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
          paymentTime: new Date().toISOString(),
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

// APPROVE PAYMENT AND CREATE RECEIPT
export async function approvePayment(
  quotationId: string,
  fileId: string,
  paymentKey: string,
  resubmissionKey?: string,
  internalNotes?: string
) {
  const denied = await requirePermissionOrError(PERMISSIONS["billing:manage"]);
  if (denied) return denied;

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
        [`${paymentPath}.internalDecisionTime`]: new Date().toISOString(),
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
  const denied = await requirePermissionOrError(PERMISSIONS["billing:manage"]);
  if (denied) return denied;

  const paymentPath = resubmissionKey
    ? `payments[_key=="${paymentKey}"].resubmissions[_key=="${resubmissionKey}"]`
    : `payments[_key=="${paymentKey}"]`;

  try {
    const quotation = await writeClient
      .patch(quotationId)
      .set({
        [`${paymentPath}.internalStatus`]: "rejected",
        [`${paymentPath}.internalNotes`]: internalNotes,
        [`${paymentPath}.internalDecisionTime`]: new Date().toISOString(),
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
  const denied = await requirePermissionOrError(PERMISSIONS["clients:create"]);
  if (denied) return denied;

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

// CREATE SAMPLE RECEIPT
export async function createSampleReceipt(
  prevState: any,
  formData: FormData,
  fileId: string
) {
  try {
    const projectId = formData.get("projectId") as string;
    const reviewItems = JSON.parse(formData.get("reviewItems") as string);
    const adequacyChecks = JSON.parse(formData.get("adequacyChecks") as string);
    const overallStatus = formData.get("overallStatus") as string;
    const overallComments = formData.get("overallComments") as string;
    const clientAcknowledgement = JSON.parse(
      formData.get("clientAcknowledgement") as string
    );
    const getlabAcknowledgement = JSON.parse(
      formData.get("getlabAcknowledgement") as string
    );
    const sampleReceiptPersonnel = JSON.parse(
      formData.get("sampleReceiptPersonnel") as string
    );
    const reviewTemplate = formData.get("reviewTemplate") as string;
    const adequacyTemplate = formData.get("adequacyTemplate") as string;
    const sampleReceiptNumber = formData.get("sampleReceiptNumber") as string;

    // Create the sample receipt document
    const currentYear = new Date().getFullYear();
    const sampleReceiptId = `sampleReceipt-${Date.now()}`;
    const tx = writeClient.transaction();

    tx.create({
      _id: sampleReceiptId,
      _type: "sampleReceipt",
      project: {
        _type: "reference",
        _ref: projectId,
      },
      // Numbers required by schema
      sampleReceiptNumber:
        sampleReceiptNumber && sampleReceiptNumber.trim() !== ""
          ? sampleReceiptNumber
          : `SR${currentYear}-${Date.now().toString().slice(-6)}`,
      revisionNumber: `R${currentYear}-00`,
      status: "draft",
      reviewTemplate: reviewTemplate
        ? {
            _type: "reference",
            _ref: reviewTemplate,
          }
        : undefined,
      reviewItems: reviewItems.map((item: any) => ({
        templateItemId: item.id,
        label: item.label,
        status: item.status,
        comments: item.comments || "",
      })),
      adequacyTemplate: adequacyTemplate
        ? {
            _type: "reference",
            _ref: adequacyTemplate,
          }
        : undefined,
      adequacyChecks: adequacyChecks.map((item: any) => ({
        templateItemId: item.id,
        label: item.label,
        status: item.status,
        comments: item.comments || "",
      })),
      overallStatus,
      overallComments: overallComments || "",
      clientAcknowledgement: clientAcknowledgement
        ? {
            acknowledgementText:
              clientAcknowledgement.acknowledgementText || "",
            clientSignature: clientAcknowledgement.clientSignature || "",
            clientRepresentative:
              clientAcknowledgement.clientRepresentative || "",
          }
        : undefined,
      getlabAcknowledgement: getlabAcknowledgement
        ? {
            // expectedDeliveryDate can be set at approval phase; optional here
            sampleRetentionDuration:
              getlabAcknowledgement.sampleRetentionDuration || "",
            acknowledgementText:
              getlabAcknowledgement.acknowledgementText || "",
          }
        : undefined,
      sampleReceiptPersonnel: {
        role: sampleReceiptPersonnel.role,
        name: sampleReceiptPersonnel.name,
        personnel: sampleReceiptPersonnel.personnel
          ? {
              _type: "reference",
              _ref: sampleReceiptPersonnel.personnel,
            }
          : undefined,
      },
      file: {
        _type: "file",
        asset: {
          _type: "reference",
          _ref: fileId,
        },
      },
    });

    tx.patch(projectId, (p) =>
      p.set({
        sampleReceipt: { _type: "reference", _ref: sampleReceiptId },
      })
    );

    await tx.commit({
      autoGenerateArrayKeys: true,
    });

    revalidateTag(`project-${projectId}`);
    return { result: { _id: sampleReceiptId }, status: "ok" };
  } catch (error) {
    console.error("Error creating sample receipt:", error);
    return { error: "Failed to create sample receipt", status: "error" };
  }
}

// UPDATE SAMPLE RECEIPT
export async function updateSampleReceipt(
  prevState: any,
  formData: FormData,
  fileId: string
) {
  try {
    const projectId = formData.get("projectId") as string;
    const sampleReceiptId = formData.get("sampleReceiptId") as string;
    const reviewItems = JSON.parse(formData.get("reviewItems") as string);
    const adequacyChecks = JSON.parse(formData.get("adequacyChecks") as string);
    const overallStatus = formData.get("overallStatus") as string;
    const overallComments = formData.get("overallComments") as string;
    const clientAcknowledgement = JSON.parse(
      formData.get("clientAcknowledgement") as string
    );
    const getlabAcknowledgement = JSON.parse(
      formData.get("getlabAcknowledgement") as string
    );
    const sampleReceiptPersonnel = JSON.parse(
      formData.get("sampleReceiptPersonnel") as string
    );
    const reviewTemplate = formData.get("reviewTemplate") as string;
    const adequacyTemplate = formData.get("adequacyTemplate") as string;
    const sampleReceiptNumber = formData.get("sampleReceiptNumber") as string;
    const revisionNumber = formData.get("revisionNumber") as string;

    // Get the existing sample receipt to access its file
    const existingSampleReceipt =
      await writeClient.getDocument(sampleReceiptId);

    const tx = writeClient.transaction();

    // Store the old file asset ID for deletion
    const oldFileAssetId = existingSampleReceipt?.file?.asset?._id;

    // Update the sample receipt document with new file (this will overwrite the old file reference)
    tx.patch(sampleReceiptId, (p) =>
      p.set({
        sampleReceiptNumber:
          sampleReceiptNumber || existingSampleReceipt?.sampleReceiptNumber,
        revisionNumber: revisionNumber || existingSampleReceipt?.revisionNumber,
        reviewTemplate: reviewTemplate
          ? {
              _type: "reference",
              _ref: reviewTemplate,
            }
          : undefined,
        reviewItems: reviewItems.map((item: any) => ({
          templateItemId: item.id,
          label: item.label,
          status: item.status,
          comments: item.comments || "",
        })),
        adequacyTemplate: adequacyTemplate
          ? {
              _type: "reference",
              _ref: adequacyTemplate,
            }
          : undefined,
        adequacyChecks: adequacyChecks.map((item: any) => ({
          templateItemId: item.id,
          label: item.label,
          status: item.status,
          comments: item.comments || "",
        })),
        overallStatus,
        overallComments: overallComments || "",
        clientAcknowledgement: clientAcknowledgement
          ? {
              acknowledgementText:
                clientAcknowledgement.acknowledgementText || "",
              clientSignature: clientAcknowledgement.clientSignature || "",
              clientRepresentative:
                clientAcknowledgement.clientRepresentative || "",
            }
          : undefined,
        getlabAcknowledgement: getlabAcknowledgement
          ? {
              sampleRetentionDuration:
                getlabAcknowledgement.sampleRetentionDuration || "",
              acknowledgementText:
                getlabAcknowledgement.acknowledgementText || "",
            }
          : undefined,
        sampleReceiptPersonnel: {
          role: sampleReceiptPersonnel.role,
          name: sampleReceiptPersonnel.name,
          personnel: sampleReceiptPersonnel.personnel
            ? {
                _type: "reference",
                _ref: sampleReceiptPersonnel.personnel,
              }
            : undefined,
        },
        file: {
          _type: "file",
          asset: {
            _type: "reference",
            _ref: fileId,
          },
        },
      })
    );

    // Delete the old PDF file AFTER setting the new one (to ensure we don't lose files on error)
    if (oldFileAssetId) {
      tx.delete(oldFileAssetId);
    }

    await tx.commit({ autoGenerateArrayKeys: true });

    revalidateTag(`project-${projectId}`);
    return { result: "ok", status: "ok" };
  } catch (error) {
    console.error("Error updating sample receipt:", error);
    return { error: "Failed to update sample receipt", status: "error" };
  }
}

// SUBMIT SAMPLE RECEIPT FOR APPROVAL
export async function submitSampleReceiptForApproval(
  prevState: any,
  formData: FormData
) {
  try {
    const sampleReceiptId = formData.get("sampleReceiptId") as string;
    const projectId = formData.get("projectId") as string;

    if (!sampleReceiptId) {
      return { error: "Sample receipt ID is required", status: "error" };
    }

    // Update the sample receipt status to "submitted"
    const sampleReceipt = await writeClient
      .patch(sampleReceiptId)
      .set({
        status: "submitted",
        submittedAt: new Date().toISOString(),
      })
      .commit({ autoGenerateArrayKeys: true });

    revalidateTag(`project-${projectId}`);

    return { result: sampleReceipt, status: "ok" };
  } catch (error) {
    console.error("Error submitting sample receipt for approval:", error);
    return {
      error: "Failed to submit sample receipt for approval",
      status: "error",
    };
  }
}

// APPROVE SAMPLE RECEIPT
export async function approveSampleReceipt(prevState: any, formData: FormData) {
  try {
    const sampleReceiptId = formData.get("sampleReceiptId") as string;
    const projectId = formData.get("projectId") as string;
    const getlabAcknowledgement = formData.get(
      "getlabAcknowledgement"
    ) as string;
    const approvalDecision = formData.get("approvalDecision") as string;
    const rejectionReason = formData.get("rejectionReason") as string;
    const expectedDeliveryDate = formData.get("expectedDeliveryDate") as string;
    const sampleRetentionDuration = formData.get(
      "sampleRetentionDuration"
    ) as string;
    const approvedBy = formData.get("approvedBy") as string;

    if (!sampleReceiptId) {
      return { error: "Sample receipt ID is required", status: "error" };
    }

    if (!approvalDecision) {
      return { error: "Approval decision is required", status: "error" };
    }

    // On approval, automatically send to the client for acknowledgement
    const newStatus =
      approvalDecision === "approve" ? "sent_to_client" : "rejected";

    // Build the update object
    const updateData: any = {
      status: newStatus,
      getlabAcknowledgement: {
        acknowledgementText: getlabAcknowledgement || "",
        approvalDecision: approvalDecision,
        rejectionReason: rejectionReason || "",
        approvalDecisionAt: new Date().toISOString(),
      },
    };

    // Add approvedBy reference if provided
    if (approvedBy) {
      updateData.getlabAcknowledgement.approvalDecisionBy = {
        personnel: { _type: "reference", _ref: approvedBy },
      };
    }

    // Add approval-specific fields only when approving
    if (approvalDecision === "approve") {
      updateData.getlabAcknowledgement.expectedDeliveryDate =
        expectedDeliveryDate || "";
      updateData.getlabAcknowledgement.sampleRetentionDuration =
        sampleRetentionDuration || "";
    }

    // Update the sample receipt document
    const sampleReceipt = await writeClient
      .patch(sampleReceiptId)
      .set(updateData)
      .commit({ autoGenerateArrayKeys: true });

    revalidateTag(`project-${projectId}`);

    return { result: sampleReceipt, status: "ok" };
  } catch (error) {
    console.error("Error processing sample receipt:", error);
    return {
      error: "Failed to process sample receipt",
      status: "error",
    };
  }
}

// ACKNOWLEDGE SAMPLE RECEIPT (CLIENT)
export async function acknowledgeSampleReceipt(
  prevState: any,
  formData: FormData
) {
  try {
    const sampleReceiptId = formData.get("sampleReceiptId") as string;
    const projectId = formData.get("projectId") as string;
    const acknowledgementText = formData.get("acknowledgementText") as string;
    const clientSignature = formData.get("clientSignature") as string;
    const clientRepresentative = formData.get("clientRepresentative") as string;

    if (!sampleReceiptId) {
      return { error: "Sample receipt ID is required", status: "error" };
    }

    if (!acknowledgementText || !clientSignature || !clientRepresentative) {
      return {
        error: "All acknowledgement fields are required",
        status: "error",
      };
    }

    // Update the sample receipt with client acknowledgement and set status to client_acknowledged
    const sampleReceipt = await writeClient
      .patch(sampleReceiptId)
      .set({
        status: "client_acknowledged",
        clientAcknowledgement: {
          acknowledgementText,
          clientSignature,
          clientRepresentative,
          acknowledgedAt: new Date().toISOString(),
        },
      })
      .commit({ autoGenerateArrayKeys: true });

    revalidateTag(`project-${projectId}`);

    return { result: sampleReceipt, status: "ok" };
  } catch (error) {
    console.error("Error acknowledging sample receipt:", error);
    return {
      error: "Failed to acknowledge sample receipt",
      status: "error",
    };
  }
}

// CREATE SAMPLE RECEIPT REVISION
export async function createSampleReceiptRevision(
  prevState: any,
  formData: FormData,
  fileId: string
) {
  try {
    const projectId = formData.get("projectId") as string;
    const reviewItems = JSON.parse(formData.get("reviewItems") as string);
    const adequacyChecks = JSON.parse(formData.get("adequacyChecks") as string);
    const overallStatus = formData.get("overallStatus") as string;
    const overallComments = formData.get("overallComments") as string;
    const clientAcknowledgement = JSON.parse(
      formData.get("clientAcknowledgement") as string
    );
    const getlabAcknowledgement = JSON.parse(
      formData.get("getlabAcknowledgement") as string
    );
    const sampleReceiptPersonnel = JSON.parse(
      formData.get("sampleReceiptPersonnel") as string
    );
    const reviewTemplate = formData.get("reviewTemplate") as string;
    const adequacyTemplate = formData.get("adequacyTemplate") as string;
    const originalSampleReceiptId = formData.get(
      "originalSampleReceiptId"
    ) as string;

    if (!originalSampleReceiptId) {
      return {
        error: "Original sample receipt ID is required",
        status: "error",
      };
    }

    // Fetch original to compute next revision number and reuse number
    const original = await writeClient.getDocument(originalSampleReceiptId);
    const origNumber = original?.sampleReceiptNumber as string | undefined;
    const origRev =
      (original?.revisionNumber as string | undefined) ||
      `R${new Date().getFullYear()}-00`;

    // Parse current revision number and increment
    const nextRevNum = (() => {
      const match = /R(\d{4})-(\d{2})/.exec(origRev || "");
      const currentYear = new Date().getFullYear();

      if (match) {
        const revYear = parseInt(match[1], 10);
        const revNum = parseInt(match[2], 10);

        // If it's the same year, increment the number
        if (revYear === currentYear) {
          const nextNum = revNum + 1;
          return `R${currentYear}-${nextNum.toString().padStart(2, "0")}`;
        }
      }

      // Start fresh for the current year
      return `R${currentYear}-00`;
    })();

    const tx = writeClient.transaction();

    // Create the new revision document
    const newRevisionId = `sampleReceipt-${Date.now()}`;
    tx.create({
      _id: newRevisionId,
      _type: "sampleReceipt",
      project: {
        _type: "reference",
        _ref: projectId,
      },
      sampleReceiptNumber:
        origNumber ||
        `SR${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
      revisionNumber: nextRevNum,
      status: "submitted", // Start as submitted for approval
      reviewTemplate: reviewTemplate
        ? {
            _type: "reference",
            _ref: reviewTemplate,
          }
        : undefined,
      reviewItems: reviewItems.map((item: any) => ({
        templateItemId: item.id,
        label: item.label,
        status: item.status,
        comments: item.comments || "",
      })),
      adequacyTemplate: adequacyTemplate
        ? {
            _type: "reference",
            _ref: adequacyTemplate,
          }
        : undefined,
      adequacyChecks: adequacyChecks.map((item: any) => ({
        templateItemId: item.id,
        label: item.label,
        status: item.status,
        comments: item.comments || "",
      })),
      overallStatus,
      overallComments: overallComments || "",
      clientAcknowledgement: clientAcknowledgement
        ? {
            acknowledgementText:
              clientAcknowledgement.acknowledgementText || "",
            clientSignature: clientAcknowledgement.clientSignature || "",
            clientRepresentative:
              clientAcknowledgement.clientRepresentative || "",
          }
        : undefined,
      getlabAcknowledgement: getlabAcknowledgement
        ? {
            sampleRetentionDuration:
              getlabAcknowledgement.sampleRetentionDuration || "",
            acknowledgementText:
              getlabAcknowledgement.acknowledgementText || "",
          }
        : undefined,
      sampleReceiptPersonnel: {
        role: sampleReceiptPersonnel.role,
        name: sampleReceiptPersonnel.name,
        personnel: sampleReceiptPersonnel.personnel
          ? {
              _type: "reference",
              _ref: sampleReceiptPersonnel.personnel,
            }
          : undefined,
      },
      file: {
        _type: "file",
        asset: {
          _type: "reference",
          _ref: fileId,
        },
      },
    });

    // Update the original sample receipt to reference this revision
    tx.patch(originalSampleReceiptId, (p) =>
      p
        .setIfMissing({ revisions: [] })
        .append("revisions", [{ _type: "reference", _ref: newRevisionId }])
    );

    // Update the project to point to the new revision
    tx.patch(projectId, (p) =>
      p.set({ sampleReceipt: { _type: "reference", _ref: newRevisionId } })
    );

    await tx.commit({ autoGenerateArrayKeys: true });

    revalidateTag(`project-${projectId}`);
    return { result: { _id: newRevisionId }, status: "ok" };
  } catch (error) {
    console.error("Error creating sample receipt revision:", error);
    return {
      error: "Failed to create sample receipt revision",
      status: "error",
    };
  }
}

export async function setProjectDateRange(prevState: any, formData: FormData) {
  const denied = await requirePermissionOrError(PERMISSIONS["projects:update"]);
  if (denied) return denied;

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
  const denied = await requirePermissionOrError(PERMISSIONS["projects:create"]);
  if (denied) return denied;

  try {
    const internalId = formData.get("internalId");
    const projectName = formData.get("projectName");
    const dateFrom = formData.get("dateFrom");
    const dateTo = formData.get("dateTo");
    const labId = formData.get("labId") as string | null;
    const clients = formData
      .getAll("clients")
      .map((client) => JSON.parse(client as string));

    if (clients.some((client) => client.clientType === "new")) {
      const clientDenied = await requirePermissionOrError(
        PERMISSIONS["clients:create"]
      );
      if (clientDenied) return clientDenied;
    }

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
    if (labId) {
      const lab = await writeClient.fetch<{
        projects?: Array<{ _ref: string }>;
      }>(`*[_type == "lab" && _id == $labId][0]{ projects[]{ _ref } }`, {
        labId,
      });

      if (lab) {
        const existingIds = (lab.projects ?? []).map((item) => item._ref);
        const mergedIds = [...new Set([...existingIds, project._id])];

        await writeClient
          .patch(labId)
          .set({
            projects: mergedIds.map((id) => ({
              _type: "reference",
              _ref: id,
              _key: uuidv4(),
            })),
          })
          .commit();

        revalidateTag("labs");
        revalidatePath(`/labs/${labId}`);
      }
    }
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
  const denied = await requirePermissionOrError(PERMISSIONS["projects:create"]);
  if (denied) return denied;

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
  const denied = await requirePermissionOrError(PERMISSIONS["projects:update"]);
  if (denied) return denied;

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
  const denied = await requirePermissionOrError(PERMISSIONS["projects:update"]);
  if (denied) return denied;

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
  const denied = await requirePermissionOrError(PERMISSIONS["clients:update"]);
  if (denied) return denied;

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
  const denied = await requirePermissionOrError(PERMISSIONS["clients:update"]);
  if (denied) return denied;

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
  const denied = await requirePermissionOrError(PERMISSIONS["clients:update"]);
  if (denied) return denied;

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
      appAccessStatus: "none",
      client: {
        _type: "reference",
        _ref: clientId,
      },
    });

    const session = await getSession();
    const invitedBy = session.isAuthenticated ? session : undefined;

    const { inviteContactToPortal } = await import("@/lib/auth/contact-invite");
    await inviteContactToPortal({
      contactPersonId: result._id,
      email: email as string,
      fullName: name as string,
      clientId: clientId as string,
      invitedBy,
    });

    revalidateTag("contactPerson");
    revalidateTag(`client-${clientId}`);
    return { result, status: "ok" };
  } catch (error) {
    return { error, status: "error" };
  }
}

export async function inviteContactToPortalAction(contactPersonId: string) {
  const denied = await requirePermissionOrError(PERMISSIONS["clients:update"]);
  if (denied) return denied;

  try {
    const contact = await writeClient.fetch<{
      _id: string;
      name: string;
      email: string;
      appAccessStatus?: string;
      clerkUserId?: string;
      portalPermissions?: string[];
      client?: { _id: string } | null;
    } | null>(
      `*[_type == "contactPerson" && _id == $contactPersonId][0]{
        _id,
        name,
        email,
        appAccessStatus,
        clerkUserId,
        portalPermissions,
        client->{ _id }
      }`,
      { contactPersonId }
    );

    if (!contact?.email) {
      return { status: "error", error: "Contact not found" };
    }

    const session = await getSession();
    const invitedBy = session.isAuthenticated ? session : undefined;

    const { inviteContactToPortal } = await import("@/lib/auth/contact-invite");
    await inviteContactToPortal({
      contactPersonId: contact._id,
      email: contact.email,
      fullName: contact.name,
      clientId: contact.client?._id,
      portalPermissions: contact.portalPermissions,
      clerkUserId: contact.clerkUserId,
      invitedBy,
    });

    revalidateTag("contactPerson");
    revalidateTag(`client-${contact.client?._id}`);
    return { status: "ok" };
  } catch (error) {
    console.error("Error inviting contact to portal:", error);
    return { status: "error", error: "Failed to send portal invitation" };
  }
}

export async function lockContactPortalAccessAction(contactPersonId: string) {
  const denied = await requirePermissionOrError(PERMISSIONS["clients:update"]);
  if (denied) return denied;

  try {
    const contact = await writeClient.fetch<{
      _id: string;
      email: string;
      clerkUserId?: string;
      client?: { _id: string } | null;
    } | null>(
      `*[_type == "contactPerson" && _id == $contactPersonId][0]{
        _id,
        email,
        clerkUserId,
        client->{ _id }
      }`,
      { contactPersonId }
    );

    if (!contact?.email) {
      return { status: "error", error: "Contact not found" };
    }

    const session = await getSession();
    const lockedBy = session.isAuthenticated ? session : undefined;

    const { lockContactPortalAccess } = await import(
      "@/lib/auth/contact-invite"
    );
    await lockContactPortalAccess({
      contactPersonId: contact._id,
      email: contact.email,
      clerkUserId: contact.clerkUserId,
      lockedBy,
    });

    revalidateTag("contactPerson");
    revalidateTag(`client-${contact.client?._id}`);
    return { status: "ok" };
  } catch (error) {
    console.error("Error locking contact portal access:", error);
    return { status: "error", error: "Failed to lock portal access" };
  }
}

/** @deprecated Use lockContactPortalAccessAction */
export const revokeContactPortalAccessAction = lockContactPortalAccessAction;

export async function unlockContactPortalAccessAction(contactPersonId: string) {
  const denied = await requirePermissionOrError(PERMISSIONS["clients:update"]);
  if (denied) return denied;

  try {
    const contact = await writeClient.fetch<{
      _id: string;
      email: string;
      clerkUserId?: string;
      client?: { _id: string } | null;
    } | null>(
      `*[_type == "contactPerson" && _id == $contactPersonId][0]{
        _id,
        email,
        clerkUserId,
        client->{ _id }
      }`,
      { contactPersonId }
    );

    if (!contact?.email) {
      return { status: "error", error: "Contact not found" };
    }

    const session = await getSession();
    const unlockedBy = session.isAuthenticated ? session : undefined;

    const { unlockContactPortalAccess } = await import(
      "@/lib/auth/contact-invite"
    );
    await unlockContactPortalAccess({
      contactPersonId: contact._id,
      email: contact.email,
      clerkUserId: contact.clerkUserId,
      unlockedBy,
    });

    revalidateTag("contactPerson");
    revalidateTag(`client-${contact.client?._id}`);
    return { status: "ok" };
  } catch (error) {
    console.error("Error unlocking contact portal access:", error);
    return { status: "error", error: "Failed to unlock portal access" };
  }
}

// DELETE CONTACT PERSON
export async function deleteContactPerson(contactId: string) {
  const denied = await requirePermissionOrError(PERMISSIONS["clients:update"]);
  if (denied) return denied;

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
  const denied = await requirePermissionOrError(PERMISSIONS["clients:update"]);
  if (denied) return denied;

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
  const denied = await requirePermissionOrError(PERMISSIONS["clients:delete"]);
  if (denied) return denied;

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

type ProjectDeletePayment = {
  _key?: string | null;
  paymentProof?: { asset?: { _id: string } | null } | null;
  internalStatus?: string | null;
  receipt?: { asset?: { _id: string } | null } | null;
  resubmissions?: Array<{
    _key?: string | null;
    paymentProof?: { asset?: { _id: string } | null } | null;
    internalStatus?: string | null;
    receipt?: { asset?: { _id: string } | null } | null;
  }> | null;
} | null;

const collectPaymentUnsetPaths = (
  payments: ProjectDeletePayment[] | null | undefined,
  assetIdsToDelete: string[]
): string[] => {
  const unsetPaths: string[] = [];

  for (const pay of payments ?? []) {
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

  return unsetPaths;
};

// Schema types that hold a direct reference to a project document.
// rfi.project, sampleReceipt.project, project.sampleReceipt, lab.projects[], personnel.projects
const PROJECT_REFERENCER_DETACH_TYPES = new Set(["lab", "personnel"]);
const PROJECT_REFERENCER_DELETE_TYPES = new Set(["rfi", "sampleReceipt"]);

type QuotationDeleteDoc = {
  _id: string;
  file?: { asset?: { _id: string } | null } | null;
  invoice?: { asset?: { _id: string } | null } | null;
  payments?: ProjectDeletePayment[] | null;
  revisionRefIds?: string[] | null;
};

type QuotationReferencer = {
  _id: string;
  _type: string;
  quotationRef?: string | null;
  revisionRefs?: string[];
};

type SampleReceiptDeleteDoc = {
  _id: string;
  file?: { asset?: { _id: string } | null } | null;
  revisionRefIds?: string[] | null;
};

type SampleReceiptReferencer = {
  _id: string;
  _type: string;
  sampleReceiptRef?: string | null;
  revisionRefs?: string[];
};

type ProjectDeleteDependencies = {
  referencers: Array<{ _id: string; _type: string }>;
  rfis: Array<{
    _id: string;
    attachments?: Array<{ asset?: { _id: string } | null }> | null;
    conversation?: Array<{
      attachments?: Array<{ asset?: { _id: string } | null }> | null;
    }> | null;
  }>;
  labApprovalWorkflows: Array<{ _id: string }>;
};

const QUOTATION_DELETE_PROJECTION = `
  _id,
  file { asset->{ _id } },
  invoice { asset->{ _id } },
  payments[] {
    _key,
    internalStatus,
    paymentProof { asset->{ _id } },
    receipt { asset->{ _id } },
    resubmissions[] {
      _key,
      internalStatus,
      paymentProof { asset->{ _id } },
      receipt { asset->{ _id } }
    }
  },
  "revisionRefIds": revisions[]._ref
`;

const fetchProjectDeleteDependencies = async (
  projectId: string
): Promise<ProjectDeleteDependencies> =>
  writeClient.fetch(
    `{
      "referencers": *[_id != $projectId && references($projectId)] {
        _id,
        _type
      },
      "rfis": *[_type == "rfi" && references($projectId)] {
        _id,
        attachments[] { asset->{ _id } },
        conversation[] { attachments[] { asset->{ _id } } }
      },
      "labApprovalWorkflows": *[
        _type == "labApprovalWorkflow"
        && rfi._ref in *[_type == "rfi" && references($projectId)]._id
      ] {
        _id
      }
    }`,
    { projectId }
  );

const isDraftDocumentId = (documentId: string) =>
  documentId.startsWith("drafts.");

const collectProjectQuotationIds = async (
  projectId: string
): Promise<string[]> => {
  const rootId = await writeClient.fetch<string | null>(
    `*[_type == "project" && _id == $projectId][0].quotation._ref`,
    { projectId }
  );

  if (!rootId) return [];

  const ids = new Set<string>([rootId]);
  let changed = true;

  while (changed) {
    changed = false;
    const currentIds = [...ids];

    const expansion = await writeClient.fetch<{
      childRefs: (string | null)[];
      parentIds: string[];
    }>(
      `{
        "childRefs": array::unique(*[_type == "quotation" && _id in $currentIds].revisions[]._ref),
        "parentIds": *[
          _type == "quotation"
          && !(_id match "drafts.*")
          && count(revisions[]._ref[@ in $currentIds]) > 0
        ]._id
      }`,
      { currentIds }
    );

    for (const id of [
      ...expansion.childRefs.filter((refId): refId is string => Boolean(refId)),
      ...expansion.parentIds,
    ]) {
      if (!ids.has(id)) {
        ids.add(id);
        changed = true;
      }
    }
  }

  for (const referencer of await fetchQuotationReferencers([...ids])) {
    if (
      referencer._type === "quotation" &&
      !isDraftDocumentId(referencer._id) &&
      !ids.has(referencer._id)
    ) {
      ids.add(referencer._id);
    }
  }

  return [...ids];
};

const fetchQuotationDeleteDocs = async (
  quotationIds: string[]
): Promise<QuotationDeleteDoc[]> => {
  if (quotationIds.length === 0) return [];

  return writeClient.fetch<QuotationDeleteDoc[]>(
    `*[_type == "quotation" && _id in $quotationIds] { ${QUOTATION_DELETE_PROJECTION} }`,
    { quotationIds }
  );
};

const fetchQuotationReferencers = async (
  quotationIds: string[]
): Promise<QuotationReferencer[]> => {
  if (quotationIds.length === 0) return [];

  const byFields = await writeClient.fetch<QuotationReferencer[]>(
    `*[
      !(_id in $quotationIds)
      && (
        quotation._ref in $quotationIds
        || count(revisions[]._ref[@ in $quotationIds]) > 0
      )
    ] {
      _id,
      _type,
      "quotationRef": quotation._ref,
      "revisionRefs": revisions[]._ref[@ in $quotationIds]
    }`,
    { quotationIds }
  );

  const byReferences =
    quotationIds.length === 0
      ? []
      : await writeClient.fetch<QuotationReferencer[]>(
          `*[references($quotationIds) && !(_id in $quotationIds)] {
            _id,
            _type,
            "quotationRef": quotation._ref,
            "revisionRefs": revisions[]._ref[@ in $quotationIds]
          }`,
          { quotationIds }
        );

  const merged = new Map<string, QuotationReferencer>();
  for (const referencer of [...byFields, ...byReferences]) {
    const existing = merged.get(referencer._id);
    if (!existing) {
      merged.set(referencer._id, referencer);
      continue;
    }

    merged.set(referencer._id, {
      ...existing,
      quotationRef: existing.quotationRef ?? referencer.quotationRef,
      revisionRefs: [
        ...new Set([
          ...(existing.revisionRefs ?? []),
          ...(referencer.revisionRefs ?? []),
        ]),
      ],
    });
  }

  return [...merged.values()];
};

const detachQuotationReferencers = (
  tx: ReturnType<typeof writeClient.transaction>,
  quotationIds: string[],
  referencers: QuotationReferencer[],
  draftIdsToDelete: Set<string>
) => {
  const quotationIdSet = new Set(quotationIds);

  for (const referencer of referencers) {
    if (isDraftDocumentId(referencer._id)) {
      draftIdsToDelete.add(referencer._id);
      continue;
    }

    const unsetPaths: string[] = [];

    if (
      referencer.quotationRef &&
      quotationIdSet.has(referencer.quotationRef)
    ) {
      unsetPaths.push("quotation");
    }

    for (const revisionRef of referencer.revisionRefs ?? []) {
      unsetPaths.push(`revisions[_ref == "${revisionRef}"]`);
    }

    if (unsetPaths.length) {
      tx.patch(referencer._id, (p) => p.unset(unsetPaths));
    }
  }
};

const SAMPLE_RECEIPT_DELETE_PROJECTION = `
  _id,
  file { asset->{ _id } },
  "revisionRefIds": revisions[]._ref
`;

const collectProjectSampleReceiptIds = async (
  projectId: string
): Promise<string[]> => {
  const { roots, attachedRef } = await writeClient.fetch<{
    roots: string[];
    attachedRef: string | null;
  }>(
    `{
      "roots": *[
        _type == "sampleReceipt"
        && (references($projectId) || project._ref == $projectId)
      ]._id,
      "attachedRef": *[_type == "project" && _id == $projectId][0].sampleReceipt._ref
    }`,
    { projectId }
  );

  const initialIds = [...roots];
  if (attachedRef && !initialIds.includes(attachedRef)) {
    initialIds.push(attachedRef);
  }

  if (initialIds.length === 0) return [];

  const ids = new Set<string>(initialIds);
  let changed = true;

  while (changed) {
    changed = false;
    const currentIds = [...ids];

    const expansion = await writeClient.fetch<{
      childRefs: (string | null)[];
      parentIds: string[];
    }>(
      `{
        "childRefs": array::unique(*[_type == "sampleReceipt" && _id in $currentIds].revisions[]._ref),
        "parentIds": *[
          _type == "sampleReceipt"
          && !(_id match "drafts.*")
          && count(revisions[]._ref[@ in $currentIds]) > 0
        ]._id
      }`,
      { currentIds }
    );

    for (const id of [
      ...expansion.childRefs.filter((refId): refId is string => Boolean(refId)),
      ...expansion.parentIds,
    ]) {
      if (!ids.has(id)) {
        ids.add(id);
        changed = true;
      }
    }
  }

  for (const referencer of await fetchSampleReceiptReferencers([...ids])) {
    if (
      referencer._type === "sampleReceipt" &&
      !isDraftDocumentId(referencer._id) &&
      !ids.has(referencer._id)
    ) {
      ids.add(referencer._id);
    }
  }

  return [...ids];
};

const fetchSampleReceiptDeleteDocs = async (
  sampleReceiptIds: string[]
): Promise<SampleReceiptDeleteDoc[]> => {
  if (sampleReceiptIds.length === 0) return [];

  return writeClient.fetch<SampleReceiptDeleteDoc[]>(
    `*[_type == "sampleReceipt" && _id in $sampleReceiptIds] { ${SAMPLE_RECEIPT_DELETE_PROJECTION} }`,
    { sampleReceiptIds }
  );
};

const fetchSampleReceiptReferencers = async (
  sampleReceiptIds: string[]
): Promise<SampleReceiptReferencer[]> => {
  if (sampleReceiptIds.length === 0) return [];

  const byFields = await writeClient.fetch<SampleReceiptReferencer[]>(
    `*[
      !(_id in $sampleReceiptIds)
      && (
        sampleReceipt._ref in $sampleReceiptIds
        || count(revisions[]._ref[@ in $sampleReceiptIds]) > 0
      )
    ] {
      _id,
      _type,
      "sampleReceiptRef": sampleReceipt._ref,
      "revisionRefs": revisions[]._ref[@ in $sampleReceiptIds]
    }`,
    { sampleReceiptIds }
  );

  const byReferences =
    sampleReceiptIds.length === 0
      ? []
      : await writeClient.fetch<SampleReceiptReferencer[]>(
          `*[references($sampleReceiptIds) && !(_id in $sampleReceiptIds)] {
            _id,
            _type,
            "sampleReceiptRef": sampleReceipt._ref,
            "revisionRefs": revisions[]._ref[@ in $sampleReceiptIds]
          }`,
          { sampleReceiptIds }
        );

  const merged = new Map<string, SampleReceiptReferencer>();
  for (const referencer of [...byFields, ...byReferences]) {
    const existing = merged.get(referencer._id);
    if (!existing) {
      merged.set(referencer._id, referencer);
      continue;
    }

    merged.set(referencer._id, {
      ...existing,
      sampleReceiptRef:
        existing.sampleReceiptRef ?? referencer.sampleReceiptRef,
      revisionRefs: [
        ...new Set([
          ...(existing.revisionRefs ?? []),
          ...(referencer.revisionRefs ?? []),
        ]),
      ],
    });
  }

  return [...merged.values()];
};

const fetchSampleReceiptDraftIds = async (
  sampleReceiptIds: string[]
): Promise<string[]> => {
  if (sampleReceiptIds.length === 0) return [];

  return writeClient.fetch<string[]>(
    `*[
      _id match "drafts.*"
      && string::split(_id, ".")[1] in $sampleReceiptIds
    ]._id`,
    { sampleReceiptIds }
  );
};

const orderSampleReceiptDocsForDeletion = (
  sampleReceipts: SampleReceiptDeleteDoc[]
): SampleReceiptDeleteDoc[] => {
  const childIds = new Set(
    sampleReceipts.flatMap((sampleReceipt) => sampleReceipt.revisionRefIds ?? [])
  );

  return [
    ...sampleReceipts.filter((sampleReceipt) => childIds.has(sampleReceipt._id)),
    ...sampleReceipts.filter(
      (sampleReceipt) => !childIds.has(sampleReceipt._id)
    ),
  ];
};

const detachSampleReceiptReferencers = (
  tx: ReturnType<typeof writeClient.transaction>,
  sampleReceiptIds: string[],
  referencers: SampleReceiptReferencer[],
  draftIdsToDelete: Set<string>
) => {
  const sampleReceiptIdSet = new Set(sampleReceiptIds);

  for (const referencer of referencers) {
    if (isDraftDocumentId(referencer._id)) {
      draftIdsToDelete.add(referencer._id);
      continue;
    }

    const unsetPaths: string[] = [];

    if (
      referencer.sampleReceiptRef &&
      sampleReceiptIdSet.has(referencer.sampleReceiptRef)
    ) {
      unsetPaths.push("sampleReceipt");
    }

    for (const revisionRef of referencer.revisionRefs ?? []) {
      unsetPaths.push(`revisions[_ref == "${revisionRef}"]`);
    }

    if (unsetPaths.length) {
      tx.patch(referencer._id, (p) => p.unset(unsetPaths));
    }
  }
};

const fetchQuotationDraftIds = async (
  quotationIds: string[]
): Promise<string[]> => {
  if (quotationIds.length === 0) return [];

  return writeClient.fetch<string[]>(
    `*[
      _id match "drafts.*"
      && string::split(_id, ".")[1] in $quotationIds
    ]._id`,
    { quotationIds }
  );
};

const orderQuotationDocsForDeletion = (
  quotations: QuotationDeleteDoc[]
): QuotationDeleteDoc[] => {
  const childIds = new Set(
    quotations.flatMap((quotation) => quotation.revisionRefIds ?? [])
  );

  return [
    ...quotations.filter((quotation) => childIds.has(quotation._id)),
    ...quotations.filter((quotation) => !childIds.has(quotation._id)),
  ];
};

const collectRFIAssetIds = (
  rfi: ProjectDeleteDependencies["rfis"][number],
  assetIdsToDelete: string[]
) => {
  for (const attachment of rfi.attachments ?? []) {
    push(assetIdsToDelete, attachment.asset?._id);
  }
  for (const message of rfi.conversation ?? []) {
    for (const attachment of message.attachments ?? []) {
      push(assetIdsToDelete, attachment.asset?._id);
    }
  }
};

const detachProjectReferencer = (
  tx: ReturnType<typeof writeClient.transaction>,
  projectId: string,
  referencer: { _id: string; _type: string }
) => {
  if (referencer._type === "lab") {
    tx.patch(referencer._id, (p) =>
      p.unset([`projects[_ref == "${projectId}"]`])
    );
    return;
  }

  if (referencer._type === "personnel") {
    tx.patch(referencer._id, (p) => p.unset(["projects"]));
  }
};

export async function deleteProjectById(projectId: string) {
  const { getProjectById } = await import(
    "@/sanity/lib/projects/getProjectById"
  );
  const projects = await getProjectById(projectId);
  const project = projects?.[0];

  if (!project) {
    return { status: "error" as const, error: "Project not found" };
  }

  return deleteProject(project);
}

const fetchSampleReceiptBlockingReferencers = async (
  sampleReceiptIds: string[]
): Promise<Array<{ _id: string; _type: string }>> => {
  if (sampleReceiptIds.length === 0) return [];

  return writeClient.fetch<Array<{ _id: string; _type: string }>>(
    `*[references($sampleReceiptIds) && !(_id in $sampleReceiptIds)] {
      _id,
      _type
    }`,
    { sampleReceiptIds }
  );
};

const applySampleReceiptReferencerDetaches = (
  tx: ReturnType<typeof writeClient.transaction>,
  sampleReceiptIds: string[],
  referencers: Array<{ _id: string; _type: string }>,
  excludedDocumentIds: Set<string>
): string | null => {
  const unknownTypes = new Set<string>();

  for (const referencer of referencers) {
    if (excludedDocumentIds.has(referencer._id)) continue;

    if (referencer._type === "project") {
      tx.patch(referencer._id, (p) => p.unset(["sampleReceipt"]));
      continue;
    }

    if (referencer._type === "sampleReceipt") {
      for (const sampleReceiptId of sampleReceiptIds) {
        tx.patch(referencer._id, (p) =>
          p.unset([`revisions[_ref == "${sampleReceiptId}"]`])
        );
      }
      continue;
    }

    unknownTypes.add(referencer._type);
  }

  if (unknownTypes.size > 0) {
    return `Cannot delete project: sample receipt still referenced by (${[...unknownTypes].join(", ")})`;
  }

  return null;
};

const fetchExistingDocumentIds = async (
  documentIds: string[]
): Promise<string[]> => {
  if (documentIds.length === 0) return [];

  return writeClient.fetch<string[]>(`*[_id in $documentIds]._id`, {
    documentIds,
  });
};

const formatDeleteProjectError = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return "Failed to delete project";
};

export async function deleteProject(
  project: PROJECT_BY_ID_QUERY_RESULT[number]
) {
  const denied = await requirePermissionOrError(PERMISSIONS["projects:delete"]);
  if (denied) return denied;

  const projectId = project._id;

  try {
    const [dependencies, quotationIds, collectedSampleReceiptIds] =
      await Promise.all([
        fetchProjectDeleteDependencies(projectId),
        collectProjectQuotationIds(projectId),
        collectProjectSampleReceiptIds(projectId),
      ]);
    const assetIdsToDelete: string[] = [];

    const unknownReferencers = dependencies.referencers.filter(
      (referencer) =>
        !PROJECT_REFERENCER_DETACH_TYPES.has(referencer._type) &&
        !PROJECT_REFERENCER_DELETE_TYPES.has(referencer._type)
    );

    if (unknownReferencers.length > 0) {
      const types = [
        ...new Set(unknownReferencers.map((referencer) => referencer._type)),
      ];
      return {
        status: "error" as const,
        error: `Cannot delete project: unsupported referencers found (${types.join(", ")})`,
      };
    }

    const sampleReceiptIds = [
      ...new Set([
        ...collectedSampleReceiptIds,
        ...dependencies.referencers
          .filter((referencer) => referencer._type === "sampleReceipt")
          .map((referencer) => referencer._id),
      ]),
    ];

    const [
      quotationDocs,
      quotationReferencers,
      quotationDraftIds,
      sampleReceiptDocs,
      sampleReceiptReferencers,
      sampleReceiptDraftIds,
      sampleReceiptBlockingReferencers,
    ] = await Promise.all([
      fetchQuotationDeleteDocs(quotationIds).then(orderQuotationDocsForDeletion),
      fetchQuotationReferencers(quotationIds),
      fetchQuotationDraftIds(quotationIds),
      fetchSampleReceiptDeleteDocs(sampleReceiptIds).then(
        orderSampleReceiptDocsForDeletion
      ),
      fetchSampleReceiptReferencers(sampleReceiptIds),
      fetchSampleReceiptDraftIds(sampleReceiptIds),
      fetchSampleReceiptBlockingReferencers(sampleReceiptIds),
    ]);

    const quotationIdSet = new Set(quotationIds);
    const sampleReceiptIdSet = new Set(sampleReceiptIds);

    const quotationDraftIdsToDelete = new Set(quotationDraftIds);
    const sampleReceiptDraftIdsToDelete = new Set(sampleReceiptDraftIds);
    const draftProjectId = `drafts.${projectId}`;
    const pendingDraftIds = [
      ...quotationDraftIdsToDelete,
      ...sampleReceiptDraftIdsToDelete,
      draftProjectId,
      ...sampleReceiptIds.map((sampleReceiptId) => `drafts.${sampleReceiptId}`),
    ];
    const existingDraftIds = await fetchExistingDocumentIds(pendingDraftIds);
    const excludedSampleReceiptReferencerIds = new Set([
      ...existingDraftIds,
      ...sampleReceiptIds,
    ]);

    const detachTx = writeClient.transaction();

    // 1) Detach shared documents that reference the project, and detach
    // project-owned references before deleting dependent documents
    for (const referencer of dependencies.referencers) {
      if (PROJECT_REFERENCER_DETACH_TYPES.has(referencer._type)) {
        detachProjectReferencer(detachTx, projectId, referencer);
      }
    }

    detachTx.patch(projectId, (p) => p.unset(["quotation", "sampleReceipt"]));

    if (existingDraftIds.includes(draftProjectId)) {
      detachTx.patch(draftProjectId, (p) =>
        p.unset(["quotation", "sampleReceipt"])
      );
    }

    // 2) Detach every document that references a quotation in this chain —
    // other projects, parent quotations, and drafts included
    detachQuotationReferencers(
      detachTx,
      quotationIds,
      quotationReferencers,
      quotationDraftIdsToDelete
    );

    // 3) Detach quotation files, invoices, payments, and revision links
    for (const quotationDoc of quotationDocs) {
      const unsetPaths: string[] = [];

      if (quotationDoc.file?.asset?._id) {
        unsetPaths.push("file");
        push(assetIdsToDelete, quotationDoc.file.asset._id);
      }
      if (quotationDoc.invoice?.asset?._id) {
        unsetPaths.push("invoice");
        push(assetIdsToDelete, quotationDoc.invoice.asset._id);
      }

      unsetPaths.push(
        ...collectPaymentUnsetPaths(quotationDoc.payments, assetIdsToDelete)
      );

      for (const revisionRefId of quotationDoc.revisionRefIds ?? []) {
        if (quotationIdSet.has(revisionRefId)) {
          unsetPaths.push(`revisions[_ref == "${revisionRefId}"]`);
        }
      }

      if (unsetPaths.length) {
        detachTx.patch(quotationDoc._id, (p) => p.unset(unsetPaths));
      }
    }

    // 4) Detach sample receipt revision links and PDF files.
    // Do not unset the required project reference — delete the documents instead.
    detachSampleReceiptReferencers(
      detachTx,
      sampleReceiptIds,
      sampleReceiptReferencers,
      sampleReceiptDraftIdsToDelete
    );

    for (const sampleReceipt of sampleReceiptDocs) {
      const unsetPaths: string[] = [];

      if (sampleReceipt.file?.asset?._id) {
        unsetPaths.push("file");
        push(assetIdsToDelete, sampleReceipt.file.asset._id);
      }

      for (const revisionRefId of sampleReceipt.revisionRefIds ?? []) {
        if (sampleReceiptIdSet.has(revisionRefId)) {
          unsetPaths.push(`revisions[_ref == "${revisionRefId}"]`);
        }
      }

      if (unsetPaths.length) {
        detachTx.patch(sampleReceipt._id, (p) => p.unset(unsetPaths));
      }
    }

    for (const draftId of existingDraftIds) {
      detachTx.delete(draftId);
    }

    const referencerError = applySampleReceiptReferencerDetaches(
      detachTx,
      sampleReceiptIds,
      sampleReceiptBlockingReferencers,
      excludedSampleReceiptReferencerIds
    );

    if (referencerError) {
      return {
        status: "error" as const,
        error: referencerError,
      };
    }

    await detachTx.commit({ returnDocuments: false });

    for (const rfi of dependencies.rfis) {
      collectRFIAssetIds(rfi, assetIdsToDelete);
    }

    const existingAssetIds = new Set(
      await fetchExistingDocumentIds([...new Set(assetIdsToDelete)])
    );

    const deleteTx = writeClient.transaction();

    for (const assetId of existingAssetIds) {
      deleteTx.delete(assetId);
    }

    for (const workflow of dependencies.labApprovalWorkflows) {
      deleteTx.delete(workflow._id);
    }

    for (const rfi of dependencies.rfis) {
      deleteTx.delete(rfi._id);
    }

    for (const sampleReceipt of sampleReceiptDocs) {
      deleteTx.delete(sampleReceipt._id);
    }

    for (const quotationDoc of quotationDocs) {
      deleteTx.delete(quotationDoc._id);
    }

    deleteTx.delete(projectId);

    const result = await deleteTx.commit({ returnDocuments: false });

    revalidateTag("projects");
    revalidateTag("rfis");
    revalidateTag(`project-${projectId}`);
    revalidatePath("/projects");
    revalidatePath(`/projects/${projectId}`);
    return { result, status: "ok" };
  } catch (error) {
    console.error("deleteProject failed:", error);
    return {
      status: "error" as const,
      error: formatDeleteProjectError(error),
    };
  }
}

// DELETE RFI
export async function deleteRFI(rfi: ALL_RFIS_QUERY_RESULT[number]) {
  const rfiId = rfi._id;
  const tx = writeClient.transaction();

  try {
    // Collect all asset IDs to delete
    const assetIdsToDelete: string[] = [];

    // Helper function to push unique asset IDs
    const pushAssetId = (assetId?: string | null) => {
      if (assetId && !assetIdsToDelete.includes(assetId)) {
        assetIdsToDelete.push(assetId);
      }
    };

    // 1) Handle initial attachments
    if (rfi.attachments) {
      for (const attachment of rfi.attachments) {
        if (attachment.asset?._id) {
          pushAssetId(attachment.asset._id);
        }
      }
    }

    // 2) Handle conversation message attachments
    if (rfi.conversation) {
      for (const message of rfi.conversation) {
        if (message.attachments) {
          for (const attachment of message.attachments) {
            if (attachment.asset?._id) {
              pushAssetId(attachment.asset._id);
            }
          }
        }
      }
    }

    // 3) Delete all assets first
    for (const assetId of assetIdsToDelete) {
      tx.delete(assetId);
    }

    // 4) Delete the RFI document
    tx.delete(rfiId);

    const result = await tx.commit({ returnDocuments: false });

    revalidateTag("rfis");
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

    const existingPersonnel = await getPersonnelByEmail((email as string).trim());
    if (existingPersonnel) {
      return {
        error: "A personnel record with this email already exists",
        status: "error",
      };
    }

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
        appAccessStatus: "none",
      },
      {
        autoGenerateArrayKeys: true,
      }
    );

    const { invitePersonnelToApp } = await import("@/lib/auth/personnel-invite");
    const { getSession } = await import("@/lib/auth/session");
    const session = await getSession();
    const invitedBy = session.isAuthenticated ? session : undefined;

    await invitePersonnelToApp({
      personnelId: result._id,
      email: email as string,
      fullName: fullName as string,
      invitedBy,
    });

    revalidateTag("personnel");
    return { result, status: "ok" };
  } catch (error) {
    console.error("createPersonnel error:", error);
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

// CREATE RFI
// CREATE RFI - Improved Implementation
export async function createRFI(prevState: any, formData: FormData) {
  const rfiManager = formData.get("rfiManager") as string;
  const initiationType = formData.get("initiationType") as string;
  const project = formData.get("project") as string;
  const client = formData.get("client") as string;
  const subject = formData.get("subject") as string;
  const description = formData.get("description") as string;
  const labInitiator = formData.get("labInitiator") as string;
  const labReceivers = formData.getAll("labReceivers") as string[];
  const clientReceivers = formData.getAll("clientReceivers") as string[];
  const labReceiversExternal = formData.getAll(
    "labReceiversExternal"
  ) as string[];
  const labInitiatorExternal = formData.get("labInitiatorExternal") as string;
  const clientInitiator = formData.get("clientInitiator") as string;

  // Basic validation
  if (!rfiManager || !initiationType || !subject || !description) {
    return { error: "Missing required fields", status: "error" };
  }

  // Conditional validation based on initiation type
  const validationErrors = await validateRFIFields({
    initiationType,
    project,
    client,
    labInitiator,
    labReceivers,
    labInitiatorExternal,
    clientReceivers,
    clientInitiator,
    labReceiversExternal,
  });

  if (validationErrors.length > 0) {
    return { error: validationErrors.join(", "), status: "error" };
  }

  try {
    // Build the RFI document based on initiation type
    const rfiDocument: any = {
      _type: "rfi",
      rfiManager: { _type: "reference", _ref: rfiManager },
      initiationType,
      subject,
      description,
      status: "open",
      dateSubmitted: new Date().toISOString(),
      attachments: [],
      conversation: [],
      statusHistory: [
        {
          _type: "object",
          status: "open",
          timestamp: new Date().toISOString(),
          previousStatus: null,
          reason: "RFI created",
          changedBy: { _type: "reference", _ref: rfiManager },
        },
      ],
    };

    // Add conditional fields based on initiation type
    if (initiationType === "internal_internal") {
      rfiDocument.labInitiator = { _type: "reference", _ref: labInitiator };

      if (labReceivers && labReceivers.length > 0) {
        rfiDocument.labReceivers = labReceivers.map((ref) => ({
          _type: "reference",
          _ref: ref,
        }));
      }
    } else if (initiationType === "internal_external") {
      rfiDocument.project = { _type: "reference", _ref: project };
      rfiDocument.client = { _type: "reference", _ref: client };
      rfiDocument.labInitiatorExternal = {
        _type: "reference",
        _ref: labInitiatorExternal,
      };

      if (clientReceivers && clientReceivers.length > 0) {
        rfiDocument.clientReceivers = clientReceivers.map((ref) => ({
          _type: "reference",
          _ref: ref,
        }));
      }
    } else if (initiationType === "external_internal") {
      rfiDocument.project = { _type: "reference", _ref: project };
      rfiDocument.client = { _type: "reference", _ref: client };
      rfiDocument.clientInitiator = {
        _type: "reference",
        _ref: clientInitiator,
      };

      if (labReceiversExternal && labReceiversExternal.length > 0) {
        rfiDocument.labReceiversExternal = labReceiversExternal.map(
          (ref: string) => ({ _type: "reference", _ref: ref })
        );
      }
    }

    const result = await writeClient.create(rfiDocument, {
      autoGenerateArrayKeys: true,
    });
    revalidateTag("rfi");
    return { result, status: "ok" };
  } catch (error) {
    console.error("Error creating RFI:", error);
    return { error: "Failed to create RFI", status: "error" };
  }
}

// Validation helper function
async function validateRFIFields(fields: {
  initiationType: string;
  project?: string;
  client?: string;
  labInitiator?: string;
  labReceivers?: string[];
  labInitiatorExternal?: string;
  clientReceivers?: string[];
  clientInitiator?: string;
  labReceiversExternal?: string[];
}): Promise<string[]> {
  const errors: string[] = [];

  const {
    initiationType,
    project,
    client,
    labInitiator,
    labReceivers,
    labInitiatorExternal,
    clientReceivers,
    clientInitiator,
    labReceiversExternal,
  } = fields;

  // Internal to Internal validation
  if (initiationType === "internal_internal") {
    if (!labInitiator) {
      errors.push("Lab Personnel Initiator is required for Internal RFIs");
    }
    if (!labReceivers || labReceivers.length === 0) {
      errors.push(
        "At least one Lab Personnel Receiver is required for Internal RFIs"
      );
    }
  }

  // Internal to External validation
  if (initiationType === "internal_external") {
    if (!project || !client) {
      errors.push(
        "Project and Client are required for Internal to External RFIs"
      );
    }
    if (!labInitiatorExternal) {
      errors.push(
        "Lab Personnel Initiator is required for Internal to External RFIs"
      );
    }
    if (!clientReceivers || clientReceivers.length === 0) {
      errors.push(
        "At least one Client Receiver is required for Internal to External RFIs"
      );
    }

    // Validate contact person relationships
    if (project && client && clientReceivers && clientReceivers.length > 0) {
      for (const receiverId of clientReceivers) {
        const isValidContact = await validateContactPersonRelationships(
          project,
          client,
          receiverId
        );
        if (!isValidContact) {
          errors.push(
            `The selected contact person ${receiverId} is not assigned to the project or not linked to the client`
          );
        }
      }
    }
  }

  // External to Internal validation
  if (initiationType === "external_internal") {
    if (!project || !client) {
      errors.push(
        "Project and Client are required for External to Internal RFIs"
      );
    }
    if (!clientInitiator) {
      errors.push("Client Initiator is required for External to Internal RFIs");
    }

    // Validate contact person relationships
    if (project && client && clientInitiator) {
      const isValidContact = await validateContactPersonRelationships(
        project,
        client,
        clientInitiator
      );
      if (!isValidContact) {
        errors.push(
          "The selected contact person is not assigned to the project or not linked to the client"
        );
      }
    }

    // Note: Lab receivers are optional for external to internal RFIs
    // No validation needed for labReceiversExternal
  }

  return errors;
}

// Helper function to validate contact person relationships
async function validateContactPersonRelationships(
  projectId: string,
  clientId: string,
  contactPersonId: string
): Promise<boolean> {
  try {
    // Fetch project with contact persons
    const project = await writeClient.fetch(
      `*[_type == "project" && _id == $projectId][0]{
        name,
        contactPersons[]->{_id}
      }`,
      { projectId }
    );

    // Fetch contact person with clients
    const contactPerson = await writeClient.fetch(
      `*[_type == "contactPerson" && _id == $contactPersonId][0]{
        client->{_id,name}
      }`,
      { contactPersonId }
    );

    // Check if contact person is assigned to project
    const isAssignedToProject = project?.contactPersons?.some(
      (person: { _id: string }) => person._id === contactPersonId
    );

    // Check if contact person is linked to client
    const isLinkedToClient = contactPerson?.client?._id === clientId;

    console.log(isLinkedToClient);

    return isAssignedToProject && isLinkedToClient;
  } catch (error) {
    console.error("Error validating contact person relationships:", error);
    return false;
  }
}

// SEND MESSAGE TO RFI
export async function sendMessageToRFI(prevState: any, formData: FormData) {
  const rfiId = formData.get("rfiId") as string;
  const message = formData.get("message") as string;
  const sentByClient = formData.get("sentByClient") as string;
  const clientSender = formData.get("clientSender") as string;
  const labSender = formData.get("labSender") as string;
  const timestamp = formData.get("timestamp") as string;

  try {
    // TODO: Senders should come from authed state data instead of being passed in as form data

    // Get attachment IDs from form data
    const attachmentIds = formData.getAll("attachments") as string[];

    const messageData: any = {
      message,
      sentByClient: sentByClient === "true",
      attachments: attachmentIds.map((id) => ({
        _type: "file",
        asset: {
          _type: "reference",
          _ref: id,
        },
      })),
      timestamp,
    };

    // Add sender information
    if (sentByClient === "true") {
      messageData.clientSender = { _type: "reference", _ref: clientSender };
    } else {
      messageData.labSender = { _type: "reference", _ref: labSender };
    }

    // Get the current RFI to check conversation length and status
    const currentRFI = await writeClient.getDocument(rfiId);
    const currentConversationLength = currentRFI?.conversation?.length || 0;
    const currentStatus = currentRFI?.status || "open";

    // Determine if this is the first message and set status accordingly
    const isFirstMessage = currentConversationLength === 0;
    const newStatus = isFirstMessage ? "in_progress" : currentStatus;

    // First, add the message to conversation
    const patch = writeClient
      .patch(rfiId)
      .setIfMissing({ conversation: [] })
      .setIfMissing({ attachments: [] })
      .append("conversation", [messageData]);

    const result = await patch.commit({
      autoGenerateArrayKeys: true,
    });

    // If this was the first message and we need to update status, do it separately
    if (isFirstMessage && currentStatus === "open") {
      const statusHistoryEntry = {
        _type: "object",
        status: "in_progress",
        timestamp: new Date().toISOString(),
        previousStatus: "open",
        reason: "First message sent - conversation started",
        changedBy:
          sentByClient === "true"
            ? { _type: "reference", _ref: clientSender }
            : { _type: "reference", _ref: labSender },
      };

      await writeClient
        .patch(rfiId)
        .setIfMissing({ statusHistory: [] })
        .set({ status: "in_progress" })
        .append("statusHistory", [statusHistoryEntry])
        .commit({
          autoGenerateArrayKeys: true,
        });
    }
    revalidateTag("rfis");
    return { result, status: "ok" };
  } catch (error) {
    console.error("Error sending message to RFI:", error);
    return { error: "Failed to send message", status: "error" };
  }
}

// MARK MESSAGE AS OFFICIAL
export async function markMessageAsOfficial(rfiId: string, messageKey: string) {
  if (!rfiId || !messageKey) {
    return { error: "Missing required fields", status: "error" };
  }

  try {
    // Get the current RFI document
    const rfi = await writeClient.getDocument(rfiId);

    if (!rfi || !rfi.conversation) {
      return { error: "No conversation found", status: "error" };
    }

    // Find and update the specific message, ensuring only one official response
    const updatedConversation = rfi.conversation.map((message: any) => {
      if (message._key === messageKey) {
        return {
          ...message,
          isOfficialResponse: true,
        };
      }
      // Remove official status from all other messages
      return {
        ...message,
        isOfficialResponse: false,
      };
    });

    // Create status history entry for resolution
    const statusHistoryEntry = {
      _type: "object",
      status: "resolved",
      timestamp: new Date().toISOString(),
      previousStatus: rfi.status || "in_progress",
      reason: "Message marked as official response",
      officialMessageKey: messageKey,
      changedBy: rfi.rfiManager || undefined,
    };

    // Update the RFI with the modified conversation, status, and history
    const result = await writeClient
      .patch(rfiId)
      .setIfMissing({ statusHistory: [] })
      .set({
        conversation: updatedConversation,
        status: "resolved",
        dateResolved: new Date().toISOString(),
      })
      .append("statusHistory", [statusHistoryEntry])
      .commit({
        autoGenerateArrayKeys: true,
      });

    revalidateTag(`rfis`);
    return { result, status: "ok" };
  } catch (error) {
    console.error("Error marking message as official:", error);
    return { error: "Failed to mark message as official", status: "error" };
  }
}

// UNMARK MESSAGE AS OFFICIAL
export async function unmarkMessageAsOfficial(
  rfiId: string,
  messageKey: string
) {
  if (!rfiId || !messageKey) {
    return { error: "Missing required fields", status: "error" };
  }

  try {
    // Get the current RFI document
    const rfi = await writeClient.getDocument(rfiId);

    if (!rfi || !rfi.conversation) {
      return { error: "No conversation found", status: "error" };
    }

    // Find and update the specific message to remove official status
    const updatedConversation = rfi.conversation.map((message: any) => {
      if (message._key === messageKey) {
        return {
          ...message,
          isOfficialResponse: false,
        };
      }
      return message;
    });

    // Create status history entry for unmarking (revert to in_progress)
    const statusHistoryEntry = {
      _type: "object",
      status: "in_progress",
      timestamp: new Date().toISOString(),
      previousStatus: "resolved",
      reason: "Official response status removed",
      officialMessageKey: null, // Clear the official message key
      changedBy: rfi.rfiManager || undefined,
    };

    // Update the RFI with the modified conversation and status history
    const result = await writeClient
      .patch(rfiId)
      .setIfMissing({ statusHistory: [] })
      .set({
        conversation: updatedConversation,
        status: "in_progress",
        dateResolved: null,
      })
      .append("statusHistory", [statusHistoryEntry])
      .commit({
        autoGenerateArrayKeys: true,
      });

    revalidateTag(`rfi-${rfiId}`);
    return { result, status: "ok" };
  } catch (error) {
    console.error("Error unmarking message as official:", error);
    return { error: "Failed to unmark message as official", status: "error" };
  }
}

// UPDATE RFI STATUS WITH AUDIT TRAIL
export async function updateRFIStatus(
  rfiId: string,
  newStatus: "open" | "in_progress" | "resolved",
  reason?: string,
  changedBy?: string,
  officialMessageKey?: string
) {
  if (!rfiId || !newStatus) {
    return { error: "Missing required fields", status: "error" };
  }

  try {
    // Get the current RFI document
    const rfi = await writeClient.getDocument(rfiId);

    if (!rfi) {
      return { error: "RFI not found", status: "error" };
    }

    const currentStatus = rfi.status;
    const currentStatusHistory = rfi.statusHistory || [];

    // If reopening (going from resolved to any other status), require reason
    if (currentStatus === "resolved" && newStatus !== "resolved" && !reason) {
      return {
        error: "Reason is required when reopening an RFI",
        status: "error",
      };
    }

    // Create new status history entry
    const statusHistoryEntry = {
      _type: "object",
      status: newStatus,
      timestamp: new Date().toISOString(),
      previousStatus: currentStatus,
      reason: reason || "",
      officialMessageKey: officialMessageKey || undefined,
      changedBy: changedBy
        ? { _type: "reference", _ref: changedBy }
        : undefined,
    };

    // Prepare the update data
    const updateData: any = {
      status: newStatus,
      statusHistory: [...currentStatusHistory, statusHistoryEntry],
    };

    // Reset dateResolved if reopening
    if (currentStatus === "resolved" && newStatus !== "resolved") {
      updateData.dateResolved = null;
    }

    // Set dateResolved if resolving
    if (newStatus === "resolved") {
      updateData.dateResolved = new Date().toISOString();
    }

    // Update the RFI
    const result = await writeClient.patch(rfiId).set(updateData).commit({
      autoGenerateArrayKeys: true,
    });

    revalidateTag("rfis");
    revalidateTag(`rfi-${rfiId}`);

    return { result, status: "ok" };
  } catch (error) {
    console.error("Error updating RFI status:", error);
    return { error: "Failed to update RFI status", status: "error" };
  }
}

// SEED SAMPLE RECEIPT VERIFICATION TEMPLATES
export async function seedSampleReceiptTemplates() {
  try {
    // Check if templates already exist
    const existingTemplates = await writeClient.fetch(
      `*[_type in ["sampleReviewTemplate", "sampleAdequacyTemplate"]]`
    );

    if (existingTemplates.length > 0) {
      return {
        error:
          "Templates already exist. Delete existing templates first if you want to reseed.",
        status: "error",
      };
    }

    // Review items data from the component
    const reviewItems = [
      {
        id: 1,
        label:
          "Is the test method adequately defined, documented and understood?",
        category: "test_method",
        isRequired: true,
      },
      {
        id: 2,
        label:
          "Is the laboratory having capability and resources to meet the customer requirements?",
        category: "lab_capability",
        isRequired: true,
      },
      {
        id: 3,
        label:
          "Is appropriate test method selected for each test and capable of meeting customer requirements?",
        category: "test_method",
        isRequired: true,
      },
      {
        id: 4,
        label:
          "Is the quantity of sample adequate to complete all the tests requested by customer?",
        category: "sample_adequacy",
        isRequired: true,
      },
      {
        id: 5,
        label:
          "Does the customer require statement of conformity? If yes, then refer the document against which the statement is to be given.",
        category: "customer_requirements",
        isRequired: true,
      },
      {
        id: 6,
        label:
          "Is the uncertainty of measurement (@ 95% confidence level) needs be taken in to consideration to provide statement of conformity as a decision rule? If No, support the written agreement from the customer in this request.",
        category: "compliance",
        isRequired: true,
      },
      {
        id: 7,
        label:
          "Are the customer requirements or any opinion and interpretation required on the results of the test?",
        category: "customer_requirements",
        isRequired: true,
      },
      {
        id: 8,
        label:
          "Has the customer issued any requirements? (i.e. project specifications, TOR...)",
        category: "customer_requirements",
        isRequired: true,
      },
      {
        id: 9,
        label:
          "Is the condition of sample, proper to conduct the test? Is the sample contaminated?",
        category: "sample_adequacy",
        isRequired: true,
      },
      {
        id: 10,
        label: "Details of sampling, if any",
        category: "sample_adequacy",
        isRequired: false,
      },
      {
        id: 11,
        label: "Are the parameters covered under the scope of accreditation?",
        category: "compliance",
        isRequired: true,
      },
    ];

    // Adequacy checks data from the component
    const adequacyChecks = [
      {
        id: 1,
        label: "Sample label",
        required: true,
        category: "sample_identification",
      },
      {
        id: 2,
        label: "Identification no. on the sample",
        required: true,
        category: "sample_identification",
      },
      {
        id: 3,
        label: "Date of sampling, if any",
        required: false,
        category: "sample_identification",
      },
      {
        id: 4,
        label: "Details of sampling, if any",
        required: false,
        category: "sample_identification",
      },
      {
        id: 5,
        label: "Source of sample",
        required: false,
        category: "sample_identification",
      },
      {
        id: 6,
        label: "Qnty of sample delivered for the resp. lab test",
        required: true,
        category: "sample_condition",
      },
      {
        id: 7,
        label: "Testing parameters to be evaluated",
        required: true,
        category: "testing_requirements",
      },
      {
        id: 8,
        label: "Testing standards to be used",
        required: false,
        category: "testing_requirements",
      },
      {
        id: 9,
        label: "Acceptance limits for resp. test, if any",
        required: true,
        category: "testing_requirements",
      },
      {
        id: 10,
        label: "Sample is not damaged",
        required: false,
        category: "sample_condition",
      },
      {
        id: 11,
        label: "Sample is packed properly, if any",
        required: true,
        category: "sample_condition",
      },
      {
        id: 12,
        label: "State of Sample (Dry or Wet)",
        required: true,
        category: "sample_condition",
      },
      {
        id: 13,
        label: "Sample Depth",
        required: false,
        category: "sample_condition",
      },
      {
        id: 14,
        label: "Terms of Reference/Request for Lab Test",
        required: true,
        category: "documentation",
      },
    ];

    // Create templates in a transaction
    const tx = writeClient.transaction();

    // Create Review Template
    tx.create({
      _type: "sampleReviewTemplate",
      name: "Standard Laboratory Review Template",
      version: "1.0",
      description: "Standard review questions for sample receipt verification",
      isActive: true,
      reviewItems: reviewItems.map((item) => ({
        id: item.id,
        label: item.label,
        category: item.category,
        isRequired: item.isRequired,
      })),
    });

    // Create Adequacy Template
    tx.create({
      _type: "sampleAdequacyTemplate",
      name: "Standard Sample Adequacy Checklist",
      version: "1.0",
      description:
        "Standard adequacy requirements for sample receipt verification",
      isActive: true,
      adequacyChecks: adequacyChecks.map((item) => ({
        id: item.id,
        label: item.label,
        required: item.required,
        category: item.category,
      })),
    });

    await tx.commit({
      autoGenerateArrayKeys: true,
    });

    revalidateTag("sampleReviewTemplate");
    revalidateTag("sampleAdequacyTemplate");

    return {
      result: {
        message: "Templates created successfully",
      },
      status: "ok",
    };
  } catch (error) {
    console.error("Error seeding templates:", error);
    return { error: "Failed to seed templates", status: "error" };
  }
}

// DELETE ALL SAMPLE RECEIPT VERIFICATION TEMPLATES
export async function deleteAllSampleReceiptTemplates() {
  try {
    // Fetch all existing templates
    const existingTemplates = await writeClient.fetch(
      `*[_type in ["sampleReviewTemplate", "sampleAdequacyTemplate"]]{
        _id,
        _type,
        name
      }`
    );

    if (existingTemplates.length === 0) {
      return {
        error: "No templates found to delete",
        status: "error",
      };
    }

    // Delete all templates in a transaction
    const tx = writeClient.transaction();

    existingTemplates.forEach((template: any) => {
      tx.delete(template._id);
    });

    await tx.commit({
      autoGenerateArrayKeys: true,
    });

    revalidateTag("sampleReviewTemplate");
    revalidateTag("sampleAdequacyTemplate");

    return {
      result: {
        message: `Successfully deleted ${existingTemplates.length} template(s)`,
        deletedTemplates: existingTemplates.map((t: any) => ({
          id: t._id,
          type: t._type,
          name: t.name,
        })),
      },
      status: "ok",
    };
  } catch (error) {
    console.error("Error deleting templates:", error);
    return { error: "Failed to delete templates", status: "error" };
  }
}

function revalidateLab(labId: string) {
  revalidateTag("labs");
  revalidatePath("/labs");
  revalidatePath(`/labs/${labId}`);
}

// CREATE LAB
export async function createLab(prevState: any, formData: FormData) {
  try {
    const internalId = formData.get("internalId");
    const name = formData.get("name");
    const labSection = formData.get("labSection");
    const status = formData.get("status") || "available";
    const location = formData.get("location");
    const capacity = formData.get("capacity");
    const description = formData.get("description");

    const lab = await writeClient.create({
      _type: "lab",
      internalId,
      name,
      labSection,
      status,
      location: location || undefined,
      capacity: capacity ? Number(capacity) : undefined,
      description: description || undefined,
    });

    revalidateTag("labs");
    revalidatePath("/labs");
    redirect(`/labs/${lab._id}?registered=1&tab=staffing`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error creating lab:", error);
    return { error, status: "error" as const };
  }
}

export async function updateLabName(formData: FormData, labId: string) {
  try {
    const name = formData.get("name");
    const result = await writeClient
      .patch(labId)
      .set({ name: name as string })
      .commit();
    revalidateLab(labId);
    return { result, status: "ok" as const };
  } catch (error) {
    console.error("Error updating lab name:", error);
    return { error, status: "error" as const };
  }
}

export async function updateLabIdentity(formData: FormData, labId: string) {
  try {
    const description = formData.get("description");
    const labSection = formData.get("labSection");
    const status = formData.get("status");
    const location = formData.get("location");
    const capacity = formData.get("capacity");

    const result = await writeClient
      .patch(labId)
      .set({
        description: description || undefined,
        labSection,
        status,
        location: location || undefined,
        capacity: capacity ? Number(capacity) : undefined,
      })
      .commit();

    revalidateLab(labId);
    return { result, status: "ok" as const };
  } catch (error) {
    console.error("Error updating lab identity:", error);
    return { error, status: "error" as const };
  }
}

export async function addLabStaff(labId: string, personnelIds: string[]) {
  try {
    if (personnelIds.length === 0) {
      return { status: "error" as const, error: "No personnel selected" };
    }

    const lab = await writeClient.fetch<{
      personnel?: Array<{ _ref: string }>;
    }>(`*[_type == "lab" && _id == $labId][0]{ personnel[]{ _ref } }`, {
      labId,
    });

    if (!lab) {
      return { status: "error" as const, error: "Laboratory not found" };
    }

    const existingIds = (lab.personnel ?? []).map((person) => person._ref);
    const mergedIds = [...new Set([...existingIds, ...personnelIds])];

    const result = await writeClient
      .patch(labId)
      .set({
        personnel: mergedIds.map((id) => ({
          _type: "reference",
          _ref: id,
          _key: uuidv4(),
        })),
      })
      .commit();

    revalidateLab(labId);
    return { result, status: "ok" as const };
  } catch (error) {
    console.error("Error adding lab staff:", error);
    return { error, status: "error" as const };
  }
}

export async function removeLabStaff(labId: string, personnelId: string) {
  return removeLabStaffBulk(labId, [personnelId]);
}

export async function removeLabStaffBulk(labId: string, personnelIds: string[]) {
  try {
    if (personnelIds.length === 0) {
      return { status: "error" as const, error: "No personnel selected" };
    }

    const lab = await writeClient.fetch<{
      personnel?: Array<{ _ref: string }>;
      labHead?: { _ref: string };
    }>(
      `*[_type == "lab" && _id == $labId][0]{ personnel[]{ _ref }, labHead }`,
      { labId }
    );

    if (!lab) {
      return { status: "error" as const, error: "Laboratory not found" };
    }

    const idsToRemove = new Set(personnelIds);
    const remainingIds = (lab.personnel ?? [])
      .map((person) => person._ref)
      .filter((id) => !idsToRemove.has(id));

    let patch = writeClient.patch(labId).set({
      personnel: remainingIds.map((id) => ({
        _type: "reference",
        _ref: id,
        _key: uuidv4(),
      })),
    });

    if (lab.labHead?._ref && idsToRemove.has(lab.labHead._ref)) {
      patch = patch.unset(["labHead"]);
    }

    const result = await patch.commit();

    revalidateLab(labId);
    return { result, status: "ok" as const };
  } catch (error) {
    console.error("Error removing lab staff:", error);
    return { error, status: "error" as const };
  }
}

export async function updateLabHead(labId: string, labHeadId: string) {
  try {
    if (!labHeadId) {
      const result = await writeClient.patch(labId).unset(["labHead"]).commit();
      revalidateLab(labId);
      return { result, status: "ok" as const };
    }

    const lab = await writeClient.fetch<{
      personnel?: Array<{ _ref: string }>;
    }>(`*[_type == "lab" && _id == $labId][0]{ personnel[]{ _ref } }`, {
      labId,
    });

    const personnelIds = (lab?.personnel ?? []).map((person) => person._ref);
    if (!personnelIds.includes(labHeadId)) {
      return {
        status: "error" as const,
        error: "Lab head must be selected from assigned personnel",
      };
    }

    const result = await writeClient
      .patch(labId)
      .set({ labHead: { _type: "reference", _ref: labHeadId } })
      .commit();

    revalidateLab(labId);
    return { result, status: "ok" as const };
  } catch (error) {
    console.error("Error updating lab head:", error);
    return { error, status: "error" as const };
  }
}

export async function updateLabStaffing(formData: FormData, labId: string) {
  try {
    const labHeadId = formData.get("labHeadId");
    const personnelIds = JSON.parse(
      (formData.get("personnelIds") as string) || "[]"
    ) as string[];

    if (!labHeadId || !personnelIds.includes(labHeadId as string)) {
      return {
        status: "error" as const,
        error: "Lab head must be selected from assigned personnel",
      };
    }

    const result = await writeClient
      .patch(labId)
      .set({
        personnel: personnelIds.map((id) => ({
          _type: "reference",
          _ref: id,
          _key: uuidv4(),
        })),
        labHead: { _type: "reference", _ref: labHeadId },
      })
      .commit();

    revalidateLab(labId);
    return { result, status: "ok" as const };
  } catch (error) {
    console.error("Error updating lab staffing:", error);
    return { error, status: "error" as const };
  }
}

export async function updateLabResources(formData: FormData, labId: string) {
  try {
    const equipmentIds = JSON.parse(
      (formData.get("equipmentIds") as string) || "[]"
    ) as string[];
    const testCapabilityIds = JSON.parse(
      (formData.get("testCapabilityIds") as string) || "[]"
    ) as string[];

    const result = await writeClient
      .patch(labId)
      .set({
        equipment: equipmentIds.map((id) => ({
          _type: "reference",
          _ref: id,
          _key: uuidv4(),
        })),
        testCapabilities: testCapabilityIds.map((id) => ({
          _type: "reference",
          _ref: id,
          _key: uuidv4(),
        })),
      })
      .commit();

    revalidateLab(labId);
    return { result, status: "ok" as const };
  } catch (error) {
    console.error("Error updating lab resources:", error);
    return { error, status: "error" as const };
  }
}

export async function addLabEquipment(labId: string, equipmentIds: string[]) {
  try {
    if (equipmentIds.length === 0) {
      return { status: "error" as const, error: "No equipment selected" };
    }

    const lab = await writeClient.fetch<{
      equipment?: Array<{ _ref: string }>;
    }>(`*[_type == "lab" && _id == $labId][0]{ equipment[]{ _ref } }`, {
      labId,
    });

    if (!lab) {
      return { status: "error" as const, error: "Laboratory not found" };
    }

    const existingIds = (lab.equipment ?? []).map((item) => item._ref);
    const mergedIds = [...new Set([...existingIds, ...equipmentIds])];

    const result = await writeClient
      .patch(labId)
      .set({
        equipment: mergedIds.map((id) => ({
          _type: "reference",
          _ref: id,
          _key: uuidv4(),
        })),
      })
      .commit();

    revalidateLab(labId);
    return { result, status: "ok" as const };
  } catch (error) {
    console.error("Error adding lab equipment:", error);
    return { error, status: "error" as const };
  }
}

export async function removeLabEquipmentBulk(
  labId: string,
  equipmentIds: string[]
) {
  try {
    if (equipmentIds.length === 0) {
      return { status: "error" as const, error: "No equipment selected" };
    }

    const lab = await writeClient.fetch<{
      equipment?: Array<{ _ref: string }>;
    }>(`*[_type == "lab" && _id == $labId][0]{ equipment[]{ _ref } }`, {
      labId,
    });

    if (!lab) {
      return { status: "error" as const, error: "Laboratory not found" };
    }

    const idsToRemove = new Set(equipmentIds);
    const remainingIds = (lab.equipment ?? [])
      .map((item) => item._ref)
      .filter((id) => !idsToRemove.has(id));

    const result = await writeClient
      .patch(labId)
      .set({
        equipment: remainingIds.map((id) => ({
          _type: "reference",
          _ref: id,
          _key: uuidv4(),
        })),
      })
      .commit();

    revalidateLab(labId);
    return { result, status: "ok" as const };
  } catch (error) {
    console.error("Error removing lab equipment:", error);
    return { error, status: "error" as const };
  }
}

export async function addLabTestCapabilities(
  labId: string,
  testCapabilityIds: string[]
) {
  try {
    if (testCapabilityIds.length === 0) {
      return { status: "error" as const, error: "No test capabilities selected" };
    }

    const lab = await writeClient.fetch<{
      testCapabilities?: Array<{ _ref: string }>;
    }>(
      `*[_type == "lab" && _id == $labId][0]{ testCapabilities[]{ _ref } }`,
      { labId }
    );

    if (!lab) {
      return { status: "error" as const, error: "Laboratory not found" };
    }

    const existingIds = (lab.testCapabilities ?? []).map((item) => item._ref);
    const mergedIds = [...new Set([...existingIds, ...testCapabilityIds])];

    const result = await writeClient
      .patch(labId)
      .set({
        testCapabilities: mergedIds.map((id) => ({
          _type: "reference",
          _ref: id,
          _key: uuidv4(),
        })),
      })
      .commit();

    revalidateLab(labId);
    return { result, status: "ok" as const };
  } catch (error) {
    console.error("Error adding lab test capabilities:", error);
    return { error, status: "error" as const };
  }
}

export async function removeLabTestCapabilitiesBulk(
  labId: string,
  testCapabilityIds: string[]
) {
  try {
    if (testCapabilityIds.length === 0) {
      return { status: "error" as const, error: "No test capabilities selected" };
    }

    const lab = await writeClient.fetch<{
      testCapabilities?: Array<{ _ref: string }>;
    }>(
      `*[_type == "lab" && _id == $labId][0]{ testCapabilities[]{ _ref } }`,
      { labId }
    );

    if (!lab) {
      return { status: "error" as const, error: "Laboratory not found" };
    }

    const idsToRemove = new Set(testCapabilityIds);
    const remainingIds = (lab.testCapabilities ?? [])
      .map((item) => item._ref)
      .filter((id) => !idsToRemove.has(id));

    const result = await writeClient
      .patch(labId)
      .set({
        testCapabilities: remainingIds.map((id) => ({
          _type: "reference",
          _ref: id,
          _key: uuidv4(),
        })),
      })
      .commit();

    revalidateLab(labId);
    return { result, status: "ok" as const };
  } catch (error) {
    console.error("Error removing lab test capabilities:", error);
    return { error, status: "error" as const };
  }
}

export async function updateLabAccreditation(formData: FormData, labId: string) {
  try {
    const accreditationStandard = formData.get("accreditationStandard");
    const accreditationCertificateNumber = formData.get(
      "accreditationCertificateNumber"
    );
    const accreditationAccreditingBody = formData.get(
      "accreditationAccreditingBody"
    );
    const accreditationExpiryDate = formData.get("accreditationExpiryDate");
    const notes = formData.get("notes");

    const result = await writeClient
      .patch(labId)
      .set({
        notes: notes || undefined,
        accreditation:
          accreditationStandard ||
          accreditationCertificateNumber ||
          accreditationAccreditingBody ||
          accreditationExpiryDate
            ? {
                standard: accreditationStandard || "ISO 17025",
                certificateNumber: accreditationCertificateNumber || undefined,
                accreditingBody: accreditationAccreditingBody || undefined,
                expiryDate: accreditationExpiryDate || undefined,
              }
            : undefined,
      })
      .commit();

    revalidateLab(labId);
    return { result, status: "ok" as const };
  } catch (error) {
    console.error("Error updating lab accreditation:", error);
    return { error, status: "error" as const };
  }
}

// UPDATE LAB
export async function updateLab(prevState: any, formData: FormData) {
  try {
    const labId = formData.get("labId");
    const internalId = formData.get("internalId");
    const name = formData.get("name");
    const labSection = formData.get("labSection");
    const status = formData.get("status");
    const location = formData.get("location");
    const capacity = formData.get("capacity");
    const description = formData.get("description");
    const notes = formData.get("notes");
    const labHeadId = formData.get("labHeadId");

    const personnelIds = JSON.parse(
      (formData.get("personnelIds") as string) || "[]"
    ) as string[];
    const equipmentIds = JSON.parse(
      (formData.get("equipmentIds") as string) || "[]"
    ) as string[];
    const testCapabilityIds = JSON.parse(
      (formData.get("testCapabilityIds") as string) || "[]"
    ) as string[];

    const accreditationStandard = formData.get("accreditationStandard");
    const accreditationCertificateNumber = formData.get(
      "accreditationCertificateNumber"
    );
    const accreditationAccreditingBody = formData.get(
      "accreditationAccreditingBody"
    );
    const accreditationExpiryDate = formData.get("accreditationExpiryDate");

    if (labHeadId && personnelIds.length > 0) {
      if (!personnelIds.includes(labHeadId as string)) {
        return {
          status: "error" as const,
          error: "Lab head must be selected from assigned personnel",
        };
      }
    }

    const updateData: Record<string, unknown> = {
      internalId,
      name,
      labSection,
      status,
      location: location || undefined,
      capacity: capacity ? Number(capacity) : undefined,
      description: description || undefined,
      notes: notes || undefined,
    };

    if (personnelIds.length > 0) {
      updateData.personnel = personnelIds.map((id) => ({
        _type: "reference",
        _ref: id,
        _key: uuidv4(),
      }));
    }

    if (labHeadId) {
      updateData.labHead = { _type: "reference", _ref: labHeadId };
    }

    updateData.equipment = equipmentIds.map((id) => ({
      _type: "reference",
      _ref: id,
      _key: uuidv4(),
    }));

    updateData.testCapabilities = testCapabilityIds.map((id) => ({
      _type: "reference",
      _ref: id,
      _key: uuidv4(),
    }));

    updateData.accreditation = {
      standard: accreditationStandard || "ISO 17025",
      certificateNumber: accreditationCertificateNumber || undefined,
      accreditingBody: accreditationAccreditingBody || undefined,
      expiryDate: accreditationExpiryDate || undefined,
    };

    const result = await writeClient
      .patch(labId as string)
      .set(updateData)
      .commit();

    revalidateTag("labs");
    revalidatePath("/labs");
    revalidatePath(`/labs/${labId}`);
    return { result, status: "ok" as const };
  } catch (error) {
    console.error("Error updating lab:", error);
    return { error, status: "error" as const };
  }
}

// DELETE MULTIPLE LABS
export async function deleteMultipleLabs(labIds: string[]) {
  try {
    const results = await Promise.all(labIds.map((labId) => deleteLab(labId)));
    const deletedItems = results.filter((result) => result.status === "ok").length;

    if (deletedItems > 0) {
      revalidateTag("labs");
      revalidatePath("/labs");
      return { results, status: "ok" as const, deletedItems };
    }

    return { results, status: "no_deletions" as const, deletedItems: 0 };
  } catch (error) {
    console.error("Error deleting laboratories:", error);
    return { error, status: "error" as const };
  }
}

// DELETE LAB
export async function deleteLab(labId: string) {
  try {
    const dependencies = await writeClient.fetch<{
      projects: Array<{ _id: string; name: string; internalId: string }>;
      workflows: Array<{ _id: string }>;
      unknownReferencers: Array<{ _id: string; _type: string }>;
    }>(
      `{
        "projects": *[_type == "lab" && _id == $labId][0].projects[]->{
          _id, name, internalId
        },
        "workflows": *[_type == "labApprovalWorkflow" && references($labId)] {
          _id
        },
        "unknownReferencers": *[
          _id != $labId
          && references($labId)
          && _type != "labApprovalWorkflow"
        ] {
          _id,
          _type
        }
      }`,
      { labId }
    );

    if ((dependencies.projects ?? []).length > 0) {
      return {
        status: "error" as const,
        error: "Cannot delete lab with assigned projects",
        projects: dependencies.projects,
      };
    }

    if ((dependencies.unknownReferencers ?? []).length > 0) {
      const types = [
        ...new Set(
          dependencies.unknownReferencers.map((referencer) => referencer._type)
        ),
      ];
      return {
        status: "error" as const,
        error: `Cannot delete lab: unsupported referencers found (${types.join(", ")})`,
      };
    }

    const tx = writeClient.transaction();

    for (const workflow of dependencies.workflows ?? []) {
      tx.delete(workflow._id);
    }

    tx.delete(labId);
    await tx.commit();

    revalidateTag("labs");
    revalidatePath("/labs");
    return { status: "ok" as const };
  } catch (error) {
    console.error("Error deleting lab:", error);
    return { error, status: "error" as const };
  }
}

// CREATE EQUIPMENT
export async function createEquipment(prevState: any, formData: FormData) {
  try {
    const internalId = formData.get("internalId");
    const name = formData.get("name");
    const serialNumber = formData.get("serialNumber");
    const category = formData.get("category");
    const manufacturer = formData.get("manufacturer");
    const model = formData.get("model");
    const status = formData.get("status") || "available";
    const notes = formData.get("notes");
    const lastMaintenance = formData.get("lastMaintenance");
    const nextMaintenance = formData.get("nextMaintenance");

    const personnelIds = JSON.parse(
      (formData.get("personnelIds") as string) || "[]"
    ) as string[];
    const userManualIds = formData.getAll("userManuals") as string[];
    const userManualNames = formData.getAll("userManualNames") as string[];

    const supplierName = formData.get("supplierName");
    const supplierContactPerson = formData.get("supplierContactPerson");
    const supplierContactEmail = formData.get("supplierContactEmail");
    const supplierContactPhone = formData.get("supplierContactPhone");

    const maintenanceCompanyName = formData.get("maintenanceCompanyName");
    const maintenanceContactPerson = formData.get("maintenanceContactPerson");
    const maintenanceContactEmail = formData.get("maintenanceContactEmail");
    const maintenanceContactPhone = formData.get("maintenanceContactPhone");

    const equipment = await writeClient.create(
      {
        _type: "equipment",
        internalId,
        name,
        serialNumber,
        category,
        manufacturer: manufacturer || undefined,
        model: model || undefined,
        status,
        notes: notes || undefined,
        lastMaintenance: lastMaintenance || undefined,
        nextMaintenance: nextMaintenance || undefined,
        assignedPersonnel: personnelIds.map((id) => ({
          _type: "reference",
          _ref: id,
          _key: uuidv4(),
        })),
        userManuals: userManualIds.map((fileId, index) => ({
          _type: "file",
          asset: {
            _type: "reference",
            _ref: fileId,
          },
          name: userManualNames[index] || undefined,
        })),
        supplier:
          supplierName ||
          supplierContactPerson ||
          supplierContactEmail ||
          supplierContactPhone
            ? {
                name: supplierName || undefined,
                contactPerson: supplierContactPerson || undefined,
                contactEmail: supplierContactEmail || undefined,
                contactPhone: supplierContactPhone || undefined,
              }
            : undefined,
        maintenanceCompany:
          maintenanceCompanyName ||
          maintenanceContactPerson ||
          maintenanceContactEmail ||
          maintenanceContactPhone
            ? {
                companyName: maintenanceCompanyName || undefined,
                contactPerson: maintenanceContactPerson || undefined,
                contactEmail: maintenanceContactEmail || undefined,
                contactPhone: maintenanceContactPhone || undefined,
              }
            : undefined,
      },
      { autoGenerateArrayKeys: true }
    );

    revalidateTag("equipment");
    revalidatePath("/equipment");
    return { result: equipment, status: "ok" as const };
  } catch (error) {
    console.error("Error creating equipment:", error);
    return { error, status: "error" as const };
  }
}

// UPDATE EQUIPMENT
export async function updateEquipment(prevState: any, formData: FormData) {
  try {
    const equipmentId = formData.get("equipmentId");
    const internalId = formData.get("internalId");
    const name = formData.get("name");
    const serialNumber = formData.get("serialNumber");
    const category = formData.get("category");
    const manufacturer = formData.get("manufacturer");
    const model = formData.get("model");
    const status = formData.get("status");
    const notes = formData.get("notes");
    const lastMaintenance = formData.get("lastMaintenance");
    const nextMaintenance = formData.get("nextMaintenance");

    const personnelIds = JSON.parse(
      (formData.get("personnelIds") as string) || "[]"
    ) as string[];
    const existingUserManuals = JSON.parse(
      (formData.get("existingUserManuals") as string) || "[]"
    ) as Array<{ _key: string; assetId: string; name?: string }>;
    const userManualIds = formData.getAll("userManuals") as string[];
    const userManualNames = formData.getAll("userManualNames") as string[];

    const supplierName = formData.get("supplierName");
    const supplierContactPerson = formData.get("supplierContactPerson");
    const supplierContactEmail = formData.get("supplierContactEmail");
    const supplierContactPhone = formData.get("supplierContactPhone");

    const maintenanceCompanyName = formData.get("maintenanceCompanyName");
    const maintenanceContactPerson = formData.get("maintenanceContactPerson");
    const maintenanceContactEmail = formData.get("maintenanceContactEmail");
    const maintenanceContactPhone = formData.get("maintenanceContactPhone");

    const result = await writeClient
      .patch(equipmentId as string)
      .set({
        internalId,
        name,
        serialNumber,
        category,
        manufacturer: manufacturer || undefined,
        model: model || undefined,
        status,
        notes: notes || undefined,
        lastMaintenance: lastMaintenance || undefined,
        nextMaintenance: nextMaintenance || undefined,
        assignedPersonnel: personnelIds.map((id) => ({
          _type: "reference",
          _ref: id,
          _key: uuidv4(),
        })),
        userManuals: [
          ...existingUserManuals
            .filter((manual) => manual.assetId)
            .map((manual) => ({
              _type: "file",
              _key: manual._key,
              asset: {
                _type: "reference",
                _ref: manual.assetId,
              },
              name: manual.name || undefined,
            })),
          ...userManualIds.map((fileId, index) => ({
            _type: "file",
            asset: {
              _type: "reference",
              _ref: fileId,
            },
            name: userManualNames[index] || undefined,
          })),
        ],
        supplier: {
          name: supplierName || undefined,
          contactPerson: supplierContactPerson || undefined,
          contactEmail: supplierContactEmail || undefined,
          contactPhone: supplierContactPhone || undefined,
        },
        maintenanceCompany: {
          companyName: maintenanceCompanyName || undefined,
          contactPerson: maintenanceContactPerson || undefined,
          contactEmail: maintenanceContactEmail || undefined,
          contactPhone: maintenanceContactPhone || undefined,
        },
      })
      .commit();

    revalidateTag("equipment");
    revalidatePath("/equipment");
    revalidatePath(`/equipment/${equipmentId}`);
    return { result, status: "ok" as const };
  } catch (error) {
    console.error("Error updating equipment:", error);
    return { error, status: "error" as const };
  }
}

// DELETE EQUIPMENT
export async function deleteEquipment(equipmentId: string) {
  try {
    const dependencies = await writeClient.fetch<{
      labs: Array<{ _id: string; name: string; internalId: string }>;
      maintenanceLogs: Array<{ _id: string }>;
      unknownReferencers: Array<{ _id: string; _type: string }>;
    }>(
      `{
        "labs": *[_type == "lab" && references($equipmentId)] {
          _id, name, internalId
        },
        "maintenanceLogs": *[_type == "maintenanceLog" && references($equipmentId)] {
          _id
        },
        "unknownReferencers": *[
          _id != $equipmentId
          && references($equipmentId)
          && _type != "lab"
          && _type != "maintenanceLog"
        ] {
          _id,
          _type
        }
      }`,
      { equipmentId }
    );

    if ((dependencies.labs ?? []).length > 0) {
      return {
        status: "error" as const,
        error: "Cannot delete equipment assigned to laboratories",
        labs: dependencies.labs,
      };
    }

    if ((dependencies.unknownReferencers ?? []).length > 0) {
      const types = [
        ...new Set(
          dependencies.unknownReferencers.map((referencer) => referencer._type)
        ),
      ];
      return {
        status: "error" as const,
        error: `Cannot delete equipment: unsupported referencers found (${types.join(", ")})`,
      };
    }

    const tx = writeClient.transaction();

    for (const lab of dependencies.labs ?? []) {
      tx.patch(lab._id, (p) =>
        p.unset([`equipment[_ref == "${equipmentId}"]`])
      );
    }

    for (const log of dependencies.maintenanceLogs ?? []) {
      tx.delete(log._id);
    }

    tx.delete(equipmentId);
    await tx.commit();

    revalidateTag("equipment");
    revalidatePath("/equipment");
    return { status: "ok" as const };
  } catch (error) {
    console.error("Error deleting equipment:", error);
    return { error, status: "error" as const };
  }
}
