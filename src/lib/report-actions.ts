"use server";

import { revalidateTag } from "next/cache";
import { writeClient } from "@/sanity/lib/write-client";
import { getSession } from "@/lib/auth/session";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { requirePermissionOrError } from "@/lib/auth/with-auth";
import { v4 as uuidv4 } from "uuid";

function nextRevisionNumber(current?: string | null) {
  const match = /R(\d{4})-(\d{2})/.exec(current || "");
  const currentYear = new Date().getFullYear();

  if (match) {
    const revYear = parseInt(match[1], 10);
    const revNum = parseInt(match[2], 10);
    if (revYear === currentYear) {
      return `R${currentYear}-${(revNum + 1).toString().padStart(2, "0")}`;
    }
  }

  return `R${currentYear}-00`;
}

export async function createReport(
  _prevState: unknown,
  formData: FormData,
  fileId: string
) {
  try {
    await requirePermissionOrError(PERMISSIONS["report:create"]);

    const projectId = formData.get("projectId") as string;
    const title = (formData.get("title") as string)?.trim();
    const summary = (formData.get("summary") as string) || "";
    const preparedBy = JSON.parse(
      (formData.get("preparedBy") as string) || "{}"
    );

    if (!projectId || !title || !fileId) {
      return {
        error: "Project, title, and report file are required",
        status: "error" as const,
      };
    }

    const currentYear = new Date().getFullYear();
    const reportId = `report-${Date.now()}`;
    const tx = writeClient.transaction();

    tx.create({
      _id: reportId,
      _type: "report",
      project: { _type: "reference", _ref: projectId },
      reportNumber: `TR${currentYear}-${Date.now().toString().slice(-6)}`,
      revisionNumber: `R${currentYear}-00`,
      title,
      summary,
      status: "draft",
      preparedBy: {
        name: preparedBy.name || "",
        role: preparedBy.role || "",
        ...(preparedBy.personnel
          ? {
              personnel: {
                _type: "reference",
                _ref: preparedBy.personnel,
              },
            }
          : {}),
      },
      file: {
        _type: "file",
        asset: { _type: "reference", _ref: fileId },
      },
      queries: [],
      revisions: [],
    });

    tx.patch(projectId, (p) =>
      p.set({
        report: { _type: "reference", _ref: reportId },
      })
    );

    await tx.commit({ autoGenerateArrayKeys: true });
    revalidateTag(`project-${projectId}`);

    return { result: { _id: reportId }, status: "ok" as const };
  } catch (error) {
    console.error("Error creating report:", error);
    return { error: "Failed to create report", status: "error" as const };
  }
}

export async function updateReport(
  _prevState: unknown,
  formData: FormData,
  fileId?: string
) {
  try {
    await requirePermissionOrError(PERMISSIONS["report:update"]);

    const projectId = formData.get("projectId") as string;
    const reportId = formData.get("reportId") as string;
    const title = (formData.get("title") as string)?.trim();
    const summary = (formData.get("summary") as string) || "";
    const preparedBy = JSON.parse(
      (formData.get("preparedBy") as string) || "{}"
    );

    if (!projectId || !reportId || !title) {
      return {
        error: "Project, report, and title are required",
        status: "error" as const,
      };
    }

    const existing = await writeClient.getDocument(reportId);
    if (!existing) {
      return { error: "Report not found", status: "error" as const };
    }

    if (
      existing.status !== "draft" &&
      existing.status !== "revisions_requested" &&
      existing.status !== "rejected"
    ) {
      return {
        error: "Only draft or revision reports can be edited",
        status: "error" as const,
      };
    }

    const updateData: Record<string, unknown> = {
      title,
      summary,
      preparedBy: {
        name: preparedBy.name || existing.preparedBy?.name || "",
        role: preparedBy.role || existing.preparedBy?.role || "",
        ...(preparedBy.personnel
          ? {
              personnel: {
                _type: "reference",
                _ref: preparedBy.personnel,
              },
            }
          : existing.preparedBy?.personnel
            ? { personnel: existing.preparedBy.personnel }
            : {}),
      },
    };

    if (fileId) {
      updateData.file = {
        _type: "file",
        asset: { _type: "reference", _ref: fileId },
      };
    }

    await writeClient
      .patch(reportId)
      .set(updateData)
      .commit({ autoGenerateArrayKeys: true });

    revalidateTag(`project-${projectId}`);
    return { result: { _id: reportId }, status: "ok" as const };
  } catch (error) {
    console.error("Error updating report:", error);
    return { error: "Failed to update report", status: "error" as const };
  }
}

export async function submitReportForQa(_prevState: unknown, formData: FormData) {
  try {
    await requirePermissionOrError(PERMISSIONS["report:update"]);

    const reportId = formData.get("reportId") as string;
    const projectId = formData.get("projectId") as string;

    if (!reportId) {
      return { error: "Report ID is required", status: "error" as const };
    }

    const report = await writeClient
      .patch(reportId)
      .set({
        status: "submitted",
        submittedAt: new Date().toISOString(),
      })
      .unset(["qaReview"])
      .commit({ autoGenerateArrayKeys: true });

    revalidateTag(`project-${projectId}`);
    return { result: report, status: "ok" as const };
  } catch (error) {
    console.error("Error submitting report for QA:", error);
    return {
      error: "Failed to submit report for QA",
      status: "error" as const,
    };
  }
}

export async function reviewReport(_prevState: unknown, formData: FormData) {
  try {
    await requirePermissionOrError(PERMISSIONS["report:approve"]);

    const session = await getSession();
    const reportId = formData.get("reportId") as string;
    const projectId = formData.get("projectId") as string;
    const decision = formData.get("decision") as
      | "accept"
      | "reject"
      | "revisions_requested";
    const notes = (formData.get("notes") as string) || "";

    if (!reportId || !decision) {
      return {
        error: "Report ID and decision are required",
        status: "error" as const,
      };
    }

    if (
      (decision === "reject" || decision === "revisions_requested") &&
      !notes.trim()
    ) {
      return {
        error: "Notes are required when rejecting or requesting revisions",
        status: "error" as const,
      };
    }

    const statusMap = {
      accept: "sent_to_client",
      reject: "rejected",
      revisions_requested: "revisions_requested",
    } as const;

    const updateData: Record<string, unknown> = {
      status: statusMap[decision],
      qaReview: {
        decision,
        notes,
        reviewedAt: new Date().toISOString(),
        reviewedBy: {
          name: session.user?.fullName || "",
          email: session.user?.email || "",
          role: session.role || "",
          ...(session.personnelId
            ? {
                personnel: {
                  _type: "reference",
                  _ref: session.personnelId,
                },
              }
            : {}),
        },
      },
    };

    if (decision === "accept") {
      updateData.sentToClientAt = new Date().toISOString();
    }

    const report = await writeClient
      .patch(reportId)
      .set(updateData)
      .commit({ autoGenerateArrayKeys: true });

    revalidateTag(`project-${projectId}`);
    return { result: report, status: "ok" as const };
  } catch (error) {
    console.error("Error reviewing report:", error);
    return { error: "Failed to review report", status: "error" as const };
  }
}

export async function createReportRevision(
  _prevState: unknown,
  formData: FormData,
  fileId: string
) {
  try {
    await requirePermissionOrError(PERMISSIONS["report:update"]);

    const projectId = formData.get("projectId") as string;
    const originalReportId = formData.get("originalReportId") as string;
    const title = (formData.get("title") as string)?.trim();
    const summary = (formData.get("summary") as string) || "";
    const preparedBy = JSON.parse(
      (formData.get("preparedBy") as string) || "{}"
    );
    const submitForQa = formData.get("submitForQa") === "true";

    if (!projectId || !originalReportId || !title || !fileId) {
      return {
        error: "Project, original report, title, and file are required",
        status: "error" as const,
      };
    }

    const original = await writeClient.getDocument(originalReportId);
    if (!original) {
      return { error: "Original report not found", status: "error" as const };
    }

    const newRevisionId = `report-${Date.now()}`;
    const nextRev = nextRevisionNumber(original.revisionNumber);
    const tx = writeClient.transaction();

    tx.create({
      _id: newRevisionId,
      _type: "report",
      project: { _type: "reference", _ref: projectId },
      reportNumber:
        original.reportNumber ||
        `TR${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
      revisionNumber: nextRev,
      title,
      summary,
      status: submitForQa ? "submitted" : "draft",
      ...(submitForQa ? { submittedAt: new Date().toISOString() } : {}),
      preparedBy: {
        name: preparedBy.name || original.preparedBy?.name || "",
        role: preparedBy.role || original.preparedBy?.role || "",
        ...(preparedBy.personnel
          ? {
              personnel: {
                _type: "reference",
                _ref: preparedBy.personnel,
              },
            }
          : original.preparedBy?.personnel
            ? { personnel: original.preparedBy.personnel }
            : {}),
      },
      file: {
        _type: "file",
        asset: { _type: "reference", _ref: fileId },
      },
      queries: [],
      revisions: [
        {
          _type: "reference",
          _ref: originalReportId,
          _key: uuidv4(),
        },
        ...(original.revisions || []),
      ],
    });

    tx.patch(projectId, (p) =>
      p.set({ report: { _type: "reference", _ref: newRevisionId } })
    );

    await tx.commit({ autoGenerateArrayKeys: true });
    revalidateTag(`project-${projectId}`);

    return { result: { _id: newRevisionId }, status: "ok" as const };
  } catch (error) {
    console.error("Error creating report revision:", error);
    return {
      error: "Failed to create report revision",
      status: "error" as const,
    };
  }
}

export async function createReportQuery(
  _prevState: unknown,
  formData: FormData
) {
  try {
    await requirePermissionOrError(PERMISSIONS["report:query"]);

    const session = await getSession();
    const reportId = formData.get("reportId") as string;
    const projectId = formData.get("projectId") as string;
    const subject = (formData.get("subject") as string)?.trim();
    const message = (formData.get("message") as string)?.trim();

    if (!reportId || !subject || !message) {
      return {
        error: "Report, subject, and message are required",
        status: "error" as const,
      };
    }

    const report = await writeClient.getDocument(reportId);
    if (!report || report.status !== "sent_to_client") {
      return {
        error: "Queries can only be created after the report is sent to you",
        status: "error" as const,
      };
    }

    const now = new Date().toISOString();
    const queryKey = uuidv4();
    const messageKey = uuidv4();

    await writeClient
      .patch(reportId)
      .setIfMissing({ queries: [] })
      .append("queries", [
        {
          _key: queryKey,
          subject,
          status: "open",
          createdAt: now,
          createdBy: {
            name: session.user?.fullName || "",
            email: session.user?.email || "",
            ...(session.contactPersonId
              ? {
                  contactPerson: {
                    _type: "reference",
                    _ref: session.contactPersonId,
                  },
                }
              : {}),
          },
          messages: [
            {
              _key: messageKey,
              message,
              sentByClient: true,
              senderName: session.user?.fullName || "",
              senderEmail: session.user?.email || "",
              timestamp: now,
              ...(session.contactPersonId
                ? {
                    contactPerson: {
                      _type: "reference",
                      _ref: session.contactPersonId,
                    },
                  }
                : {}),
            },
          ],
        },
      ])
      .commit({ autoGenerateArrayKeys: true });

    revalidateTag(`project-${projectId}`);
    return { result: { _key: queryKey }, status: "ok" as const };
  } catch (error) {
    console.error("Error creating report query:", error);
    return {
      error: "Failed to create report query",
      status: "error" as const,
    };
  }
}

export async function respondToReportQuery(
  _prevState: unknown,
  formData: FormData
) {
  try {
    const session = await getSession();
    const reportId = formData.get("reportId") as string;
    const projectId = formData.get("projectId") as string;
    const queryKey = formData.get("queryKey") as string;
    const message = (formData.get("message") as string)?.trim();
    const markAnswered = formData.get("markAnswered") === "true";
    const sentByClient = formData.get("sentByClient") === "true";

    if (!reportId || !queryKey || !message) {
      return {
        error: "Report, query, and message are required",
        status: "error" as const,
      };
    }

    if (sentByClient) {
      await requirePermissionOrError(PERMISSIONS["report:query"]);
    } else {
      await requirePermissionOrError(PERMISSIONS["report:respond"]);
    }

    const report = await writeClient.getDocument(reportId);
    if (!report) {
      return { error: "Report not found", status: "error" as const };
    }

    const queries = Array.isArray(report.queries) ? [...report.queries] : [];
    const queryIndex = queries.findIndex(
      (q: { _key?: string }) => q._key === queryKey
    );

    if (queryIndex === -1) {
      return { error: "Query not found", status: "error" as const };
    }

    const query = { ...queries[queryIndex] };
    const messages = Array.isArray(query.messages) ? [...query.messages] : [];

    messages.push({
      _key: uuidv4(),
      message,
      sentByClient,
      senderName: session.user?.fullName || "",
      senderEmail: session.user?.email || "",
      timestamp: new Date().toISOString(),
      ...(sentByClient && session.contactPersonId
        ? {
            contactPerson: {
              _type: "reference",
              _ref: session.contactPersonId,
            },
          }
        : {}),
      ...(!sentByClient && session.personnelId
        ? {
            personnel: {
              _type: "reference",
              _ref: session.personnelId,
            },
          }
        : {}),
    });

    query.messages = messages;
    if (!sentByClient && markAnswered) {
      query.status = "answered";
    } else if (sentByClient && query.status === "answered") {
      query.status = "open";
    }

    queries[queryIndex] = query;

    await writeClient
      .patch(reportId)
      .set({ queries })
      .commit({ autoGenerateArrayKeys: true });

    revalidateTag(`project-${projectId}`);
    return { status: "ok" as const };
  } catch (error) {
    console.error("Error responding to report query:", error);
    return {
      error: "Failed to respond to report query",
      status: "error" as const,
    };
  }
}

export async function closeReportQuery(
  _prevState: unknown,
  formData: FormData
) {
  try {
    await requirePermissionOrError(PERMISSIONS["report:query"]);

    const reportId = formData.get("reportId") as string;
    const projectId = formData.get("projectId") as string;
    const queryKey = formData.get("queryKey") as string;

    if (!reportId || !queryKey) {
      return {
        error: "Report and query are required",
        status: "error" as const,
      };
    }

    const report = await writeClient.getDocument(reportId);
    if (!report) {
      return { error: "Report not found", status: "error" as const };
    }

    const queries = Array.isArray(report.queries) ? [...report.queries] : [];
    const queryIndex = queries.findIndex(
      (q: { _key?: string }) => q._key === queryKey
    );

    if (queryIndex === -1) {
      return { error: "Query not found", status: "error" as const };
    }

    queries[queryIndex] = { ...queries[queryIndex], status: "closed" };

    await writeClient
      .patch(reportId)
      .set({ queries })
      .commit({ autoGenerateArrayKeys: true });

    revalidateTag(`project-${projectId}`);
    return { status: "ok" as const };
  } catch (error) {
    console.error("Error closing report query:", error);
    return { error: "Failed to close report query", status: "error" as const };
  }
}
