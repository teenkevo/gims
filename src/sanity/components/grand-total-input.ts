import { useEffect, useMemo } from "react";
import { useFormValue, set, unset } from "sanity";

export default function GrandTotalInput(props: any) {
  const subtotal = Number(useFormValue(["subtotal"]) ?? 0);
  const vatPct = Number(useFormValue(["vatPercentage"]) ?? 0);

  const computed = useMemo(() => {
    const total = subtotal + (subtotal * vatPct) / 100;
    return Math.round((total + Number.EPSILON) * 100) / 100;
  }, [subtotal, vatPct]);

  useEffect(() => {
    const current = typeof props.value === "number" ? props.value : undefined;
    if (Number.isFinite(computed)) {
      if (current !== computed) props.onChange(set(computed));
    } else if (typeof current !== "undefined") {
      props.onChange(unset());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computed]);

  // Present as read-only in the UI (component-level), while the field stays writable.
  return props.renderDefault({ ...props, readOnly: true });
}
