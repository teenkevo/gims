import React from "react";

type FormHeaderProps = {
  title: string;
  step: number;
};

function Formheader({ title, step }: FormHeaderProps) {
  return (
    <div className="md:flex items-center">
      <div className="flex items-center justify-center w-[40px] h-[25px] mb-2 md:mb-0 bg-primary text-primary-foreground mr-4">
        {step}
      </div>
      <h2 className="text-2xl font-semibold md:text-3xl tracking-tight">
        {title}
      </h2>
    </div>
  );
}

export default Formheader;
