import type { ReactNode } from "react";

import Formheader from "@/components/form-header";
import FormSpacerWrapper from "@/components/form-spacer-wrapper";

export function EquipmentStepContainer({
  showHeader,
  step,
  title,
  children,
}: {
  showHeader: boolean;
  step: number;
  title: string;
  children: ReactNode;
}) {
  if (!showHeader) {
    return <div className="space-y-6">{children}</div>;
  }

  return (
    <FormSpacerWrapper>
      <Formheader title={title} step={step} />
      {children}
    </FormSpacerWrapper>
  );
}
