import { useMemo } from "react";
import type { PROJECT_BY_ID_QUERYResult } from "../../../../../sanity.types";

/**
 * Custom hook to encapsulate all quotation-related logic and checks.
 * @param project - The project object
 * @param role - The current user role (e.g., 'client', 'admin')
 * @returns Quotation state and helper booleans
 */
export function useQuotation(
  project: PROJECT_BY_ID_QUERYResult[number] | undefined,
  role: string
) {
  return useMemo(() => {
    const parentQuotation = project?.quotation;
    const parentQuotationHasRevisions =
      (parentQuotation?.revisions?.length ?? 0) > 0;
    const isClient = role === "client";
    const isAdmin = role === "admin";
    const isClientWaitingForParentQuotation = !parentQuotation && isClient;
    const isAdminWaitingToCreateQuotation = !parentQuotation && isAdmin;
    const isParentQuotationCreated = Boolean(parentQuotation);
    const quotation = parentQuotationHasRevisions
      ? parentQuotation?.revisions?.[0]
      : parentQuotation;
    const quotationNeedsRevision =
      (quotation?.rejectionNotes?.trim()?.length ?? 0) > 0;

    const number_parent_revisions = parentQuotation?.revisions?.length ?? 0;

    return {
      parentQuotation,
      parentQuotationHasRevisions,
      isClientWaitingForParentQuotation,
      isAdminWaitingToCreateQuotation,
      isParentQuotationCreated,
      quotation,
      quotationNeedsRevision,
      number_parent_revisions,
    };
  }, [project, role]);
}
