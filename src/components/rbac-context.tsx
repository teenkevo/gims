import React, { createContext, useContext, ReactNode, useState } from "react";

// Define roles type and context shape
type Role = "admin" | "editor" | "viewer" | string;
interface RBACContextProps {
  role: Role;
  setRole: (role: Role) => void;
}

// Create the context with default values
const RBACContext = createContext<RBACContextProps | undefined>(undefined);

// Provider wrapper
export const RBACProvider = ({
  children,
  initialRole = "viewer",
}: {
  children: ReactNode;
  initialRole?: Role;
}) => {
  const [role, setRole] = useState<Role>(initialRole);

  return <RBACContext.Provider value={{ role, setRole }}>{children}</RBACContext.Provider>;
};

// Hook to consume context
export const useRBAC = () => {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error("useRBAC must be used within an RBACProvider");
  }
  return context;
};

// Higher-order component for pages or components
export const withRBAC = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => {
    const { role } = useRBAC();
    return <Component {...props} currentRole={role} />;
  };
};
