import { useMemo } from "react";
import { getQuotationVersions } from "@/features/internal/projects/quotation-versions";
import type { PROJECT_BY_ID_QUERY_RESULT } from "../../../../../sanity.types";

/**
 * Custom hook to encapsulate all quotation-related logic and checks.
 * @param project - The project object
 * @param role - The current user role (e.g., 'client', 'admin')
 * @returns Quotation state and helper booleans
 */
export function useQuotation(
  project: PROJECT_BY_ID_QUERY_RESULT[number] | undefined,
  role: string
) {
  return useMemo(() => {
    const parentQuotation = project?.quotation;
    const versions = getQuotationVersions(parentQuotation);
    const quotation = versions[0];
    const rejected = versions.slice(1);
    const parentQuotationHasRevisions = rejected.length > 0;
    const isClient = role === "client";
    const isInternal = !isClient;
    const isClientWaitingForParentQuotation = !parentQuotation && isClient;
    const isInternalWaitingToCreateQuotation = !parentQuotation && isInternal;
    const isParentQuotationCreated = Boolean(parentQuotation);
    const quotationNeedsRevision = (() => {
      const hasNotes = (quotation?.rejectionNotes?.trim()?.length ?? 0) > 0;
      if (!hasNotes) return false;
      const lastEvent = [...(quotation?.revisionEvents ?? [])]
        .filter((event) => event?.type)
        .at(-1);
      return (
        lastEvent?.type !== "revised" && lastEvent?.type !== "revisions_declined"
      );
    })();

    const number_parent_revisions =
      parentQuotation?.revisions?.filter((revision) => revision?._id).length ??
      0;

    return {
      parentQuotation,
      parentQuotationHasRevisions,
      isClientWaitingForParentQuotation,
      isInternalWaitingToCreateQuotation,
      /** @deprecated Use isInternalWaitingToCreateQuotation */
      isAdminWaitingToCreateQuotation: isInternalWaitingToCreateQuotation,
      isParentQuotationCreated,
      quotation,
      quotationNeedsRevision,
      number_parent_revisions,
      rejected,
    };
  }, [project, role]);
}
