import "server-only";

import { writeClient } from "@/sanity/lib/write-client";
import { getSession } from "@/lib/auth/session";
import { getAppBaseUrl, getEmailRedirect, getResendClient, getResendFrom } from "@/lib/email/resend";
import { getEnabledSubscriptionsForEvent } from "@/sanity/lib/notifications/getNotificationSubscriptions";
import { attachmentFromSanityFile, type EmailAttachment } from "./attachments";
import { sendCustomerInvoiceEmails, sendCustomerQuotationEmails, sendCustomerRevisionsRejectedEmails, invoiceNumberFromQuotation, type QuotationEmailContext } from "./customer-quotation";
import { sendCustomerPaymentEmails } from "./customer-payment";
import type { NotificationEventType, NotificationPayload } from "./events";
import { resolveDepartmentIdsByName, resolveDepartmentRecipients } from "./resolve-recipients";
import { renderNotificationEmail } from "./templates";
import { summarizePayments } from "@/lib/billing/payment-totals";
import {
  paymentModeLabel,
  paymentTypeLabel,
} from "@/lib/billing/payment-reference";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function inferNotificationLink(
  type: NotificationEventType,
  payload: NotificationPayload
) {
  const base = getAppBaseUrl();
  if (payload.projectId) return `${base}/projects/${payload.projectId}`;
  if (payload.clientId) return `${base}/clients/${payload.clientId}`;
  if (payload.labId) return `${base}/labs/${payload.labId}`;
  if (payload.equipmentId) return `${base}/equipment/${payload.equipmentId}`;
  if (payload.rfiId || type.startsWith("rfi.")) {
    return `${base}/requests-for-information`;
  }
  if (type.startsWith("leave.")) return `${base}/leave`;
  return undefined;
}

export type BillingNotificationContext = QuotationEmailContext;

export async function getQuotationNotificationContext(
  quotationId: string,
  projectId?: string
): Promise<BillingNotificationContext | null> {
  const doc = await writeClient.fetch<{
    quotationNumber?: string;
    grandTotal?: number;
    currency?: string;
    advance?: number;
    paymentNotes?: string | null;
    file?: { asset?: { _id?: string; originalFilename?: string | null } | null } | null;
    invoice?: { asset?: { _id?: string; originalFilename?: string | null } | null } | null;
    project?: {
      _id: string;
      name?: string;
      internalId?: string;
      clients?: Array<{ _id: string; name?: string } | null> | null;
      contactPersons?: Array<{
        name?: string | null;
        email?: string | null;
        client?: { _id?: string } | null;
      } | null> | null;
    } | null;
  } | null>(
    `*[_type == "quotation" && _id == $quotationId][0]{
      quotationNumber,
      grandTotal,
      currency,
      advance,
      paymentNotes,
      file { asset->{ _id, originalFilename } },
      invoice { asset->{ _id, originalFilename } },
      "project": *[
        _type == "project" && (
          quotation._ref == $quotationId ||
          quotation._ref in *[_type == "quotation" && $quotationId in revisions[]._ref]._id
        )
      ][0]{
        _id,
        name,
        internalId,
        clients[]->{ _id, name },
        contactPersons[]->{
          name,
          email,
          client->{ _id }
        }
      }
    }`,
    { quotationId }
  );

  if (!doc) return null;

  let project = doc.project;
  if (!project && projectId) {
    project = await writeClient.fetch<NonNullable<typeof doc>["project"]>(
      `*[_type == "project" && _id == $projectId][0]{
        _id,
        name,
        internalId,
        clients[]->{ _id, name },
        contactPersons[]->{
          name,
          email,
          client->{ _id }
        }
      }`,
      { projectId }
    );
  }

  const seenEmails = new Set<string>();
  const contacts = (project?.contactPersons ?? [])
    .flatMap((contact) => {
      const email = contact?.email?.trim();
      const name = contact?.name?.trim();
      if (!email || !name) return [];
      const key = email.toLowerCase();
      if (seenEmails.has(key)) return [];
      seenEmails.add(key);
      return [
        {
          name,
          email,
          clientId: contact?.client?._id,
        },
      ];
    });

  return {
    quotationId,
    quotationNumber: doc.quotationNumber,
    grandTotal: doc.grandTotal,
    currency: doc.currency,
    advance: doc.advance,
    paymentNotes: doc.paymentNotes ?? undefined,
    projectId: project?._id,
    projectName: project?.name,
    projectInternalId: project?.internalId,
    fileId: doc.file?.asset?._id,
    fileOriginalFilename: doc.file?.asset?.originalFilename ?? undefined,
    invoiceFileId: doc.invoice?.asset?._id,
    invoiceOriginalFilename: doc.invoice?.asset?.originalFilename ?? undefined,
    contacts,
    clients: (project?.clients ?? []).flatMap((client) =>
      client?._id ? [{ _id: client._id, name: client.name }] : []
    ),
  };
}

function toPayload(
  context: BillingNotificationContext,
  extras?: Partial<NotificationPayload>
): NotificationPayload {
  const baseUrl = getAppBaseUrl();
  return {
    quotationId: context.quotationId,
    quotationNumber: context.quotationNumber,
    grandTotal: context.grandTotal,
    currency: context.currency,
    projectId: context.projectId,
    projectName: context.projectName,
    projectInternalId: context.projectInternalId,
    clientId: extras?.clientId ?? context.clients[0]?._id,
    clientName: extras?.clientName ?? context.clients[0]?.name,
    link: context.projectId ? `${baseUrl}/projects/${context.projectId}` : undefined,
    ...extras,
  };
}

export async function emitBillingNotification(
  type: NotificationEventType,
  quotationId: string,
  extras?: Partial<NotificationPayload>
) {
  const context = await getQuotationNotificationContext(quotationId);
  if (!context) {
    console.warn(
      `Notification ${type} skipped: quotation ${quotationId} was not found`
    );
    return;
  }
  await emitNotification(type, toPayload(context, extras));
}

const QUOTATION_RESPONSE_EVENTS = {
  accepted: "quotation.accepted",
  rejected: "quotation.rejected",
  revisions_requested: "quotation.revisions_requested",
} as const;

const QUOTATION_RESPONSE_STATUS: Record<
  keyof typeof QUOTATION_RESPONSE_EVENTS,
  string
> = {
  accepted: "Accepted",
  rejected: "Rejected",
  revisions_requested: "Revisions requested",
};

export async function emitQuotationResponse(
  quotationId: string,
  status: keyof typeof QUOTATION_RESPONSE_EVENTS,
  notes?: string
) {
  const detail = notes?.trim();
  await emitBillingNotification(QUOTATION_RESPONSE_EVENTS[status], quotationId, {
    status: QUOTATION_RESPONSE_STATUS[status],
    detail: detail || undefined,
  });
}

export async function emitQuotationRevisionsRejected(
  quotationId: string,
  reason: string
) {
  const context = await getQuotationNotificationContext(quotationId);
  if (!context) {
    console.warn(
      `Notification quotation.revisions_rejected skipped: quotation ${quotationId} was not found`
    );
    return;
  }

  const detail = reason.trim() || undefined;

  try {
    await emitNotification(
      "quotation.revisions_rejected",
      toPayload(context, {
        status: "Revision request declined",
        detail,
      })
    );
  } catch (error) {
    console.error(
      "Internal quotation.revisions_rejected notification failed",
      error
    );
  }

  try {
    await sendCustomerRevisionsRejectedEmails(context, reason);
  } catch (error) {
    console.error("Customer revision rejected email failed", error);
  }
}

function quotationPdfFilename(context: BillingNotificationContext) {
  return context.quotationNumber
    ? `${context.quotationNumber}.pdf`
    : context.fileOriginalFilename;
}

export async function emitQuotationSent(quotationId: string) {
  const context = await getQuotationNotificationContext(quotationId);
  if (!context) {
    console.warn(
      `Notification quotation.sent skipped: quotation ${quotationId} was not found`
    );
    return;
  }

  const pdfAttachment = context.fileId
    ? await attachmentFromSanityFile(
        context.fileId,
        quotationPdfFilename(context)
      )
    : null;
  const attachments = pdfAttachment ? [pdfAttachment] : undefined;

  try {
    await emitNotification(
      "quotation.sent",
      toPayload(context, {
        attachmentFileId: context.fileId,
        attachmentFilename: quotationPdfFilename(context),
      }),
      { attachments }
    );
  } catch (error) {
    console.error("Internal quotation.sent notification failed", error);
  }

  try {
    await sendCustomerQuotationEmails(context, attachments);
  } catch (error) {
    console.error("Customer quotation email failed", error);
  }
}

function invoicePdfFilename(context: BillingNotificationContext) {
  const invoiceNumber = invoiceNumberFromQuotation(context.quotationNumber);
  return invoiceNumber
    ? `${invoiceNumber}.pdf`
    : context.invoiceOriginalFilename;
}

export async function emitInvoiceIssued(
  quotationId: string,
  invoiceFileId?: string,
  projectId?: string
) {
  const context = await getQuotationNotificationContext(quotationId, projectId);
  if (!context) {
    console.warn(
      `Notification invoice.issued skipped: quotation ${quotationId} was not found`
    );
    return;
  }

  const fileId = invoiceFileId ?? context.invoiceFileId;
  const pdfAttachment = fileId
    ? await attachmentFromSanityFile(fileId, invoicePdfFilename(context))
    : null;
  const attachments = pdfAttachment ? [pdfAttachment] : undefined;
  const invoiceNumber = invoiceNumberFromQuotation(context.quotationNumber);

  try {
    await emitNotification(
      "invoice.issued",
      toPayload(context, {
        invoiceNumber,
        attachmentFileId: fileId,
        attachmentFilename: invoicePdfFilename(context),
        attachmentNote: pdfAttachment
          ? "The invoice PDF is attached to this email."
          : undefined,
      }),
      { attachments }
    );
  } catch (error) {
    console.error("Internal invoice.issued notification failed", error);
  }

  try {
    await sendCustomerInvoiceEmails(context, attachments);
  } catch (error) {
    console.error("Customer invoice email failed", error);
  }
}

type PaymentNotificationKind = "submitted" | "approved" | "rejected";

type PaymentLookup = {
  paymentKey?: string;
  paymentReference?: string;
  resubmissionKey?: string;
  receiptFileId?: string;
  reason?: string;
};

type QuotationPaymentDoc = {
  _key: string;
  paymentType?: "advance" | "full" | "other" | null;
  paymentReference?: string | null;
  amount?: number | null;
  paymentMode?: "mobile" | "bank" | "cash" | null;
  internalStatus?: string | null;
  internalNotes?: string | null;
  receipt?: {
    asset?: { _id?: string; originalFilename?: string | null } | null;
  } | null;
  resubmissions?: Array<{
    _key: string;
    amount?: number | null;
    paymentMode?: "mobile" | "bank" | "cash" | null;
    internalStatus?: string | null;
    internalNotes?: string | null;
    receipt?: {
      asset?: { _id?: string; originalFilename?: string | null } | null;
    } | null;
  }> | null;
};

const PAYMENT_EVENTS = {
  submitted: "payment.submitted",
  approved: "payment.approved",
  rejected: "payment.rejected",
} as const;

const PAYMENT_STATUS = {
  submitted: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
} as const;

function findPayment(
  payments: QuotationPaymentDoc[],
  lookup: PaymentLookup
) {
  if (lookup.paymentKey) {
    return payments.find((payment) => payment._key === lookup.paymentKey);
  }
  if (lookup.paymentReference) {
    return payments.find(
      (payment) => payment.paymentReference === lookup.paymentReference
    );
  }
  return payments[payments.length - 1];
}

function paymentSlice(
  payment: QuotationPaymentDoc,
  lookup: PaymentLookup,
  kind: PaymentNotificationKind
) {
  const resubs = payment.resubmissions ?? [];
  const resub = lookup.resubmissionKey
    ? resubs.find((item) => item._key === lookup.resubmissionKey)
    : kind === "submitted"
      ? resubs[resubs.length - 1]
      : undefined;
  const current = resub ?? payment;
  return {
    amount: Number(current.amount) || Number(payment.amount) || 0,
    paymentMode: current.paymentMode ?? payment.paymentMode,
    receiptFileId: current.receipt?.asset?._id ?? payment.receipt?.asset?._id,
    receiptFilename:
      current.receipt?.asset?.originalFilename ??
      payment.receipt?.asset?.originalFilename,
    notes: current.internalNotes ?? payment.internalNotes,
  };
}

async function emitPaymentEvent(
  kind: PaymentNotificationKind,
  quotationId: string,
  lookup: PaymentLookup
) {
  const type = PAYMENT_EVENTS[kind];
  const context = await getQuotationNotificationContext(quotationId);
  if (!context) {
    console.warn(`Notification ${type} skipped: quotation ${quotationId} was not found`);
    return;
  }

  const quotation = await writeClient.fetch<{
    grandTotal?: number | null;
    currency?: string | null;
    payments?: QuotationPaymentDoc[] | null;
  } | null>(
    `*[_type == "quotation" && _id == $quotationId][0]{
      grandTotal,
      currency,
      payments[]{
        _key,
        paymentType,
        paymentReference,
        amount,
        paymentMode,
        internalStatus,
        internalNotes,
        receipt { asset->{ _id, originalFilename } },
        resubmissions[]{
          _key,
          amount,
          paymentMode,
          internalStatus,
          internalNotes,
          receipt { asset->{ _id, originalFilename } }
        }
      }
    }`,
    { quotationId }
  );

  const payments = quotation?.payments ?? [];
  const payment = findPayment(payments, lookup);
  if (!payment) {
    console.warn(`Notification ${type} skipped: payment was not found on ${quotationId}`);
    return;
  }

  const slice = paymentSlice(payment, lookup, kind);
  const totals = summarizePayments(payments, quotation?.grandTotal ?? context.grandTotal);
  const remainingBalance =
    kind === "submitted"
      ? totals.remainingAfterPending
      : totals.remainingAfterApproved;
  const invoiceNumber = invoiceNumberFromQuotation(context.quotationNumber);
  const receiptFileId = lookup.receiptFileId ?? slice.receiptFileId;
  const receiptFilename = payment.paymentReference
    ? `Receipt-${payment.paymentReference}.pdf`
    : slice.receiptFilename;
  const pdfAttachment =
    kind === "approved" && receiptFileId
      ? await attachmentFromSanityFile(receiptFileId, receiptFilename)
      : null;
  const attachments = pdfAttachment ? [pdfAttachment] : undefined;
  const payload: Partial<NotificationPayload> = {
    invoiceNumber,
    paymentAmount: slice.amount,
    paymentReference: payment.paymentReference ?? undefined,
    paymentTypeLabel: paymentTypeLabel(payment.paymentType),
    paymentModeLabel: paymentModeLabel(slice.paymentMode),
    approvedTotal: totals.approved,
    remainingBalance,
    status: PAYMENT_STATUS[kind],
    detail: kind === "rejected" ? lookup.reason?.trim() || slice.notes?.trim() : undefined,
    attachmentFileId: attachments ? receiptFileId : undefined,
    attachmentFilename: attachments ? receiptFilename : undefined,
    attachmentNote: attachments
      ? "The payment receipt is attached to this email."
      : undefined,
  };

  try {
    await emitNotification(type, toPayload(context, payload), {
      attachments,
      alwaysIncludeDepartmentNames: ["Finance"],
    });
  } catch (error) {
    console.error(`Internal ${type} notification failed`, error);
  }

  try {
    await sendCustomerPaymentEmails(
      {
        ...context,
        kind,
        invoiceNumber,
        paymentReference: payment.paymentReference ?? undefined,
        paymentTypeLabel: paymentTypeLabel(payment.paymentType),
        paymentModeLabel: paymentModeLabel(slice.paymentMode),
        paymentAmount: slice.amount,
        approvedTotal: totals.approved,
        remainingBalance,
        rejectionReason:
          kind === "rejected"
            ? lookup.reason?.trim() || slice.notes?.trim()
            : undefined,
      },
      attachments
    );
  } catch (error) {
    console.error(`Customer ${type} email failed`, error);
  }
}

export async function emitPaymentSubmitted(
  quotationId: string,
  lookup: Pick<PaymentLookup, "paymentKey" | "paymentReference">
) {
  await emitPaymentEvent("submitted", quotationId, lookup);
}

export async function emitPaymentApproved(
  quotationId: string,
  lookup: Pick<PaymentLookup, "paymentKey" | "resubmissionKey" | "receiptFileId">
) {
  await emitPaymentEvent("approved", quotationId, lookup);
}

export async function emitPaymentRejected(
  quotationId: string,
  lookup: Pick<PaymentLookup, "paymentKey" | "resubmissionKey" | "reason">
) {
  await emitPaymentEvent("rejected", quotationId, lookup);
}

export async function emitNotification(
  type: NotificationEventType,
  payload: NotificationPayload,
  options?: {
    attachments?: EmailAttachment[];
    alwaysIncludeDepartmentNames?: string[];
  }
) {
  try {
    const resend = getResendClient();
    if (!resend) {
      console.info(
        `Notification ${type} skipped: RESEND_API_KEY is not set`
      );
      return;
    }

    const redirectTo = getEmailRedirect();
    if (process.env.NODE_ENV !== "production" && !redirectTo) {
      console.info(
        `Notification ${type} skipped: set EMAIL_REDIRECT in development so mail is not sent to personnel.`
      );
      return;
    }

    const subscriptions = await getEnabledSubscriptionsForEvent(type);
    let departmentIds = [
      ...new Set(
        subscriptions.flatMap((subscription) =>
          subscription.departments.map((department) => department._id)
        )
      ),
    ];
    if (options?.alwaysIncludeDepartmentNames?.length) {
      const extraIds = await resolveDepartmentIdsByName(
        options.alwaysIncludeDepartmentNames
      );
      departmentIds = [...new Set([...departmentIds, ...extraIds])];
    }
    const recipients =
      departmentIds.length > 0
        ? await resolveDepartmentRecipients(departmentIds)
        : [];

    if (!redirectTo && recipients.length === 0) {
      return;
    }

    const session = await getSession();
    const actorName = session.isAuthenticated
      ? session.user.fullName
      : payload.actorName;
    const link = payload.link ?? inferNotificationLink(type, payload);

    const pdfAttachment =
      options?.attachments?.[0] ??
      (payload.attachmentFileId
        ? await attachmentFromSanityFile(
            payload.attachmentFileId,
            payload.attachmentFilename
          )
        : null);
    const attachments =
      options?.attachments ?? (pdfAttachment ? [pdfAttachment] : undefined);

    const email = renderNotificationEmail(type, {
      ...payload,
      actorName,
      link,
      attachmentNote: pdfAttachment
        ? payload.attachmentNote ??
          (type === "invoice.issued"
            ? "The invoice PDF is attached to this email."
            : type === "payment.approved"
              ? "The payment receipt is attached to this email."
              : "The quotation PDF is attached to this email.")
        : payload.attachmentNote,
    });
    const from = getResendFrom();

    if (redirectTo) {
      const intended =
        recipients.length > 0
          ? recipients
              .map((recipient) => `${recipient.fullName} <${recipient.email}>`)
              .join(", ")
          : departmentIds.length > 0
            ? "subscribed departments have no active personnel emails"
            : "no department listeners (dev preview)";
      const banner = `Event ${type}. Intended for: ${intended}`;
      const { error } = await resend.emails.send({
        from,
        to: redirectTo,
        subject: `[dev] ${email.subject}`,
        html: `<p style="margin:0 0 16px;padding:12px;background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;color:#92400e;font-size:13px;">${escapeHtml(banner)}</p>${email.html}`,
        text: `${banner}\n\n${email.text}`,
        attachments,
      });
      if (error) {
        throw error;
      }
      return;
    }

    const results = await Promise.allSettled(
      recipients.map(async (recipient) => {
        const { error } = await resend.emails.send({
          from,
          to: recipient.email,
          subject: email.subject,
          html: email.html,
          text: email.text,
          attachments,
        });
        if (error) {
          throw error;
        }
      })
    );

    const failed = results.filter((result) => result.status === "rejected");
    if (failed.length > 0) {
      console.error(
        `Notification ${type}: ${failed.length} of ${recipients.length} emails failed`,
        failed
      );
    }
  } catch (error) {
    console.error(`Notification ${type} failed`, error);
  }
}
