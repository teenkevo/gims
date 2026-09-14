type QuotationVersionLike = {
  _id?: string | null;
  revisionNumber?: string | null;
};

type ParentQuotationLike = QuotationVersionLike & {
  revisions?: Array<QuotationVersionLike | null> | null;
};

export function quotationRevisionRank(revisionNumber?: string | null) {
  const match = /R?(\d{4})-(\d+)/i.exec(revisionNumber ?? "");
  if (!match) return -1;
  return Number(match[1]) * 1000 + Number(match[2]);
}

export type QuotationVersion<T extends ParentQuotationLike> =
  | T
  | NonNullable<NonNullable<T["revisions"]>[number]>;

/**
 * Current quotation is the newest version among the project pointer and
 * any superseded revisions. After a rejection, the project pointer is the
 * revised quote while older rejected docs stay in `revisions`.
 */
export function getQuotationVersions<T extends ParentQuotationLike>(
  parentQuotation: T | null | undefined
): Array<QuotationVersion<T>> {
  if (!parentQuotation?._id) return [];

  const docs = [parentQuotation, ...(parentQuotation.revisions ?? [])].filter(
    (doc): doc is QuotationVersion<T> => Boolean(doc?._id)
  );

  return [...new Map(docs.map((doc) => [doc._id as string, doc])).values()].sort(
    (a, b) =>
      quotationRevisionRank(b.revisionNumber) -
      quotationRevisionRank(a.revisionNumber)
  );
}

export function getCurrentQuotation<T extends ParentQuotationLike>(
  parentQuotation: T | null | undefined
) {
  return getQuotationVersions(parentQuotation)[0];
}
