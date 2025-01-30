import { ReactNode } from "react";

type FormSpacerWrapperProps = {
  children: ReactNode;
};

const FormSpacerWrapper = ({ children }: FormSpacerWrapperProps) => {
  return <div className="mb-20 space-y-8">{children}</div>;
};

export default FormSpacerWrapper;
