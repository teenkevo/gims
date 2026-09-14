type PaymentType = "advance" | "full" | "other" | null | undefined;

export function generatePaymentReference() {
  const year = new Date().getFullYear();
  const unique = `${Date.now().toString().slice(-6)}${Math.floor(
    Math.random() * 1000
  )
    .toString()
    .padStart(3, "0")}`;
  return `PRN${year}-${unique}`;
}

export function paymentTypeLabel(paymentType: PaymentType) {
  if (paymentType === "advance") return "Advance";
  if (paymentType === "full") return "Full";
  return "Payment";
}

export function paymentListTitle(payment: {
  paymentType?: PaymentType;
  paymentReference?: string | null;
}) {
  const label = paymentTypeLabel(payment.paymentType);
  return payment.paymentReference
    ? `${label}`
    : label;
}

export function paymentModeLabel(
  paymentMode?: "mobile" | "bank" | "cash" | string | null
) {
  if (paymentMode === "mobile") return "Mobile Money";
  if (paymentMode === "bank") return "Bank Transfer";
  if (paymentMode === "cash") return "Cash";
  return undefined;
}
