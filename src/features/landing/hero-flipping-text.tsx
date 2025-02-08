import React from "react";
import { FlipWords } from "@/components/ui/flip-words";

export function HeroFlippingText() {
  const words = ["data-silos", "backlog", "delays", "paper-trails"];

  return (
    <>
      <div className="h-[7rem] hidden md:block items-center mt-20 mb-10">
        <h1 className="text-6xl font-bold tracking-tight text-foreground dark:text-foreground">
          Eliminate <FlipWords words={words} /> <br />
          in your Geotech lab
        </h1>
      </div>
      <div className="block h-[5rem] md:hidden items-center mt-20 mb-10">
        <h1 className="text-[2.0rem] leading-[2.4rem] font-bold tracking-tight text-foreground dark:text-foreground">
          Eliminate <FlipWords words={words} /> <br />
          in your Geotech lab
        </h1>
      </div>
    </>
  );
}
