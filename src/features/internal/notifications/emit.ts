import "server-only";

import { writeClient } from "@/sanity/lib/write-client";
import { getSession } from "@/lib/auth/session";
import { getAppBaseUrl, getEmailRedirect, getResendClient, getResendFrom } from "@/lib/email/resend";
import { getEnabledSubscriptionsForEvent } from "@/sanity/lib/notifications/getNotificationSubscriptions";
import { attachmentFromSanityFile, type EmailAttachment } from "./attachments";
import { sendCustomerInvoiceEmails, sendCustomerQuotationEmails, invoiceNumberFromQuotation, type QuotationEmailContext } from "./customer-quotation";
import type { NotificationEventType, NotificationPayload } from "./events";
import { resolveDepartmentRecipients } from "./resolve-recipients";
import { renderNotificationEmail } from "./templates";

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
  quotationId: string
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
      "project": *[_type == "project" && references(^._id)][0]{
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

  const seenEmails = new Set<string>();
  const contacts = (doc.project?.contactPersons ?? [])
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
    projectId: doc.project?._id,
    projectName: doc.project?.name,
    projectInternalId: doc.project?.internalId,
    fileId: doc.file?.asset?._id,
    fileOriginalFilename: doc.file?.asset?.originalFilename ?? undefined,
    invoiceFileId: doc.invoice?.asset?._id,
    invoiceOriginalFilename: doc.invoice?.asset?.originalFilename ?? undefined,
    contacts,
    clients: (doc.project?.clients ?? []).flatMap((client) =>
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
  invoiceFileId?: string
) {
  const context = await getQuotationNotificationContext(quotationId);
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

export async function emitNotification(
  type: NotificationEventType,
  payload: NotificationPayload,
  options?: { attachments?: EmailAttachment[] }
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
    const departmentIds = [
      ...new Set(
        subscriptions.flatMap((subscription) =>
          subscription.departments.map((department) => department._id)
        )
      ),
    ];
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
