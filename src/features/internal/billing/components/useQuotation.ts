import { useMemo } from "react";
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
    const parentQuotationHasRevisions =
      (parentQuotation?.revisions?.length ?? 0) > 0;
    const isClient = role === "client";
    const isInternal = !isClient;
    const isClientWaitingForParentQuotation = !parentQuotation && isClient;
    const isInternalWaitingToCreateQuotation = !parentQuotation && isInternal;
    const isParentQuotationCreated = Boolean(parentQuotation);
    const quotation = parentQuotationHasRevisions
      ? parentQuotation?.revisions?.[0]
      : parentQuotation;
    const quotationNeedsRevision =
      (quotation?.rejectionNotes?.trim()?.length ?? 0) > 0;

    const number_parent_revisions = parentQuotation?.revisions?.length ?? 0;

    const all = [...(parentQuotation?.revisions ?? []), parentQuotation];

    const rejected = parentQuotationHasRevisions ? (all.slice(1) ?? []) : [];

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
