"use client";

import { MoonLoader } from "react-spinners";

interface ContentLoadingProps {
  text?: string;
}

/** Loading state scoped to the main content area (sidebar/header stay visible). */
export default function ContentLoading({
  text = "Loading...",
}: ContentLoadingProps) {
  return (
    <div className="flex min-h-[80vh] w-full items-center justify-center gap-2">
      <MoonLoader color="#16a34a" size={36} />
      <p className="text-muted-foreground text-sm">{text}</p>
    </div>
  );
}
