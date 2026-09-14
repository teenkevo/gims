import "server-only";

import {
  getAppBaseUrl,
  getEmailRedirect,
  getResendClient,
  getResendCustomerFrom,
} from "@/lib/email/resend";
import type { EmailAttachment } from "./attachments";
import type { QuotationContact, QuotationEmailContext } from "./customer-quotation";
import {
  renderCustomerPaymentEmail,
  type CustomerPaymentEmailKind,
} from "./templates";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function portalUrlForContact(
  contact: QuotationContact,
  context: QuotationEmailContext
) {
  const clientId = contact.clientId ?? context.clients[0]?._id;
  if (!context.projectId || !clientId) return undefined;
  return `${getAppBaseUrl()}/clients/${clientId}/projects/${context.projectId}`;
}

export type CustomerPaymentEmailContext = QuotationEmailContext & {
  kind: CustomerPaymentEmailKind;
  invoiceNumber?: string;
  paymentReference?: string;
  paymentTypeLabel?: string;
  paymentModeLabel?: string;
  paymentAmount?: number;
  approvedTotal?: number;
  remainingBalance?: number;
  rejectionReason?: string;
};

export async function sendCustomerPaymentEmails(
  context: CustomerPaymentEmailContext,
  attachments?: EmailAttachment[]
) {
  const contacts = context.contacts.filter((contact) => contact.email);
  if (contacts.length === 0) {
    console.warn(
      `Customer payment ${context.kind} email skipped: quotation ${context.quotationId} has no contact emails`
    );
    return;
  }

  const resend = getResendClient();
  if (!resend) {
    console.info(
      `Customer payment ${context.kind} email skipped: RESEND_API_KEY is not set`
    );
    return;
  }

  const redirectTo = getEmailRedirect();
  if (process.env.NODE_ENV !== "production" && !redirectTo) {
    console.info(
      `Customer payment ${context.kind} email skipped: set EMAIL_REDIRECT in development so mail is not sent to clients.`
    );
    return;
  }

  const from = getResendCustomerFrom();
  const hasAttachment = Boolean(attachments?.length);

  const renderFor = (contact: QuotationContact) =>
    renderCustomerPaymentEmail({
      kind: context.kind,
      contactName: contact.name,
      projectName: context.projectName,
      projectInternalId: context.projectInternalId,
      invoiceNumber: context.invoiceNumber,
      quotationNumber: context.quotationNumber,
      paymentReference: context.paymentReference,
      paymentTypeLabel: context.paymentTypeLabel,
      paymentModeLabel: context.paymentModeLabel,
      paymentAmount: context.paymentAmount,
      grandTotal: context.grandTotal,
      approvedTotal: context.approvedTotal,
      remainingBalance: context.remainingBalance,
      currency: context.currency,
      rejectionReason: context.rejectionReason,
      portalUrl: portalUrlForContact(contact, context),
      hasAttachment,
    });

  if (redirectTo) {
    const intended = contacts
      .map((contact) => `${contact.name} <${contact.email}>`)
      .join(", ");
    const email = renderFor(contacts[0]);
    const banner = `Customer payment ${context.kind} email. Intended for: ${intended}`;
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
    contacts.map(async (contact) => {
      const email = renderFor(contact);
      const { error } = await resend.emails.send({
        from,
        to: contact.email,
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
      `Customer payment ${context.kind} email: ${failed.length} of ${contacts.length} emails failed`,
      failed
    );
  }
}
