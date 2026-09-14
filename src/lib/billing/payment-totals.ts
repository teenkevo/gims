type PaymentLike = {
  amount?: number | null;
  internalStatus?: string | null;
  resubmissions?: Array<{
    amount?: number | null;
    internalStatus?: string | null;
  }> | null;
};

export function summarizePayments(
  payments: PaymentLike[] | null | undefined,
  grandTotal = 0
) {
  let approved = 0;
  let pending = 0;

  for (const payment of payments ?? []) {
    const resubs = payment.resubmissions ?? [];
    const latest = resubs[resubs.length - 1];
    if (latest) {
      if (latest.internalStatus === "approved") {
        approved += Number(latest.amount) || 0;
      } else if (latest.internalStatus === "pending") {
        pending += Number(latest.amount) || 0;
      }
      continue;
    }

    if (payment.internalStatus === "approved") {
      approved += Number(payment.amount) || 0;
    } else if (payment.internalStatus === "pending") {
      pending += Number(payment.amount) || 0;
    }
  }

  const invoiceTotal = Number(grandTotal) || 0;
  const remainingAfterApproved = Math.max(0, invoiceTotal - approved);
  const remainingAfterPending = Math.max(0, invoiceTotal - approved - pending);

  return {
    approved,
    pending,
    remainingAfterApproved,
    remainingAfterPending,
  };
}
