import "server-only";

import { writeClient } from "@/sanity/lib/write-client";

export type EmailAttachment = {
  filename: string;
  content: Buffer;
  contentType: string;
};

function pdfFilename(hint?: string, fallback = "quotation.pdf") {
  const raw = (hint?.trim() || fallback).replace(/[/\\?%*:|"<>]/g, "-");
  return raw.toLowerCase().endsWith(".pdf") ? raw : `${raw}.pdf`;
}

export async function attachmentFromSanityFile(
  fileId: string,
  filenameHint?: string
): Promise<EmailAttachment | null> {
  const asset = await writeClient.fetch<{
    url?: string;
    originalFilename?: string | null;
    mimeType?: string | null;
  } | null>(
    `*[_id == $fileId][0]{ url, originalFilename, mimeType }`,
    { fileId }
  );

  if (!asset?.url) {
    console.warn(`Notification attachment skipped: asset ${fileId} has no URL`);
    return null;
  }

  const token = process.env.SANITY_API_TOKEN;
  const response = await fetch(asset.url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!response.ok) {
    console.warn(
      `Notification attachment skipped: failed to download ${fileId} (${response.status})`
    );
    return null;
  }

  const content = Buffer.from(await response.arrayBuffer());

  return {
    filename: pdfFilename(filenameHint ?? asset.originalFilename ?? undefined),
    content,
    contentType: asset.mimeType || "application/pdf",
  };
}
