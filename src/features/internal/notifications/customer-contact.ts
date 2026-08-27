import "server-only";

import { writeClient } from "@/sanity/lib/write-client";
import {
  getAppBaseUrl,
  getEmailRedirect,
  getResendClient,
  getResendCustomerFrom,
} from "@/lib/email/resend";
import { renderContactAddedToProjectEmail } from "./templates";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function notifyContactAddedToProject(params: {
  contactPersonId: string;
  projectId: string;
  clientId?: string;
}) {
  try {
    await sendContactAddedToProjectEmail(params);
  } catch (error) {
    console.error("Contact added-to-project email failed", error);
  }
}

async function sendContactAddedToProjectEmail(params: {
  contactPersonId: string;
  projectId: string;
  clientId?: string;
}) {
  const [contact, project] = await Promise.all([
    writeClient.fetch<{
      name?: string | null;
      email?: string | null;
      client?: { _id?: string; name?: string | null } | null;
    } | null>(
      `*[_type == "contactPerson" && _id == $contactPersonId][0]{
        name,
        email,
        client->{ _id, name }
      }`,
      { contactPersonId: params.contactPersonId }
    ),
    writeClient.fetch<{
      name?: string | null;
      internalId?: string | null;
    } | null>(
      `*[_type == "project" && _id == $projectId][0]{
        name,
        internalId
      }`,
      { projectId: params.projectId }
    ),
  ]);

  if (!contact) {
    console.warn(
      `Contact added-to-project email skipped: contact ${params.contactPersonId} not found`
    );
    return;
  }

  const email = contact.email?.trim();
  const name = contact.name?.trim();
  if (!email || !name) {
    console.warn(
      `Contact added-to-project email skipped: contact ${params.contactPersonId} has no name or email`
    );
    return;
  }

  const resend = getResendClient();
  if (!resend) {
    console.info("Contact added-to-project email skipped: RESEND_API_KEY is not set");
    return;
  }

  const redirectTo = getEmailRedirect();
  if (process.env.NODE_ENV !== "production" && !redirectTo) {
    console.info(
      "Contact added-to-project email skipped: set EMAIL_REDIRECT in development so mail is not sent to clients."
    );
    return;
  }

  const clientId = params.clientId ?? contact.client?._id;
  const portalUrl =
    clientId && params.projectId
      ? `${getAppBaseUrl()}/clients/${clientId}/projects/${params.projectId}`
      : undefined;

  const rendered = renderContactAddedToProjectEmail({
    contactName: name,
    projectName: project?.name ?? undefined,
    projectInternalId: project?.internalId ?? undefined,
    clientName: contact.client?.name ?? undefined,
    portalUrl,
  });

  const from = getResendCustomerFrom();

  if (redirectTo) {
    const banner = `Contact added-to-project email. Intended for: ${name} <${email}>`;
    const { error } = await resend.emails.send({
      from,
      to: redirectTo,
      subject: `[dev] ${rendered.subject}`,
      html: `<p style="margin:0 0 16px;padding:12px;background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;color:#92400e;font-size:13px;">${escapeHtml(banner)}</p>${rendered.html}`,
      text: `${banner}\n\n${rendered.text}`,
    });
    if (error) {
      throw error;
    }
    return;
  }

  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  });
  if (error) {
    throw error;
  }
}
