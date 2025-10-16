// ./schemas/components/SubtotalInput.tsx
import { useEffect, useMemo } from "react";
import { useFormValue, set, unset } from "sanity";

function toNum(v: unknown): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function lineTotal(it: any): number {
  // Try common shapes in order of specificity:
  // 1) explicit line total
  if (typeof it?.total !== "undefined") return toNum(it.total);
  if (typeof it?.amount !== "undefined") return toNum(it.amount);
  // 2) rate * quantity (or price * qty, unitPrice * qty)
  const rate = toNum(it?.rate ?? it?.price ?? it?.unitPrice);
  const qty = toNum(it?.quantity ?? it?.qty ?? 1);
  if (rate && qty) return rate * qty;
  return 0;
}

export default function SubtotalInput(props: any) {
  const items = (useFormValue(["items"]) as any[]) ?? [];
  const otherItems = (useFormValue(["otherItems"]) as any[]) ?? [];

  const computed = useMemo(() => {
    const a = items.reduce((sum, it) => sum + lineTotal(it), 0);
    const b = otherItems.reduce((sum, it) => sum + lineTotal(it), 0);
    const subtotal = a + b;
    return Math.round((subtotal + Number.EPSILON) * 100) / 100; // 2dp
  }, [items, otherItems]);

  useEffect(() => {
    const current = typeof props.value === "number" ? props.value : undefined;
    if (Number.isFinite(computed)) {
      if (current !== computed) props.onChange(set(computed));
    } else if (typeof current !== "undefined") {
      props.onChange(unset());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computed]);

  // Keep the native readOnly number input UI
  return props.renderDefault(props);
}
