import React from "react";
import { HeroFlippingText } from "./hero-flipping-text";
import { Announcement } from "./announcement";
import { Features } from "./features";
// import { LoginButton } from "@/components/auth/login-button";

export function Landing() {
  return (
    <div className="h-auto w-full dark:bg-black bg-white dark:bg-dot-white/[0.2] bg-dot-black/[0.2] relative justify-center">
      {/* Radial gradient for the container to give a faded look */}
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_90%,black)]"></div>
      <div className="pt-24 items-center justify-center px-5 md:px-28">
        <Announcement />
        <HeroFlippingText />
        <h2 className="text-md font-normal text-muted-foreground max-w-2xl">
          Reduce operational costs, grow revenue, and run your geotechnical
          laboratory more efficiently. Use GIMS to handle all your
          automation-related needs, increase data quality and accelerate R&D
        </h2>
        {/* <div className="my-10">
          <LoginButton variant="default" text="Get Started" />
        </div> */}

        <Features />
      </div>
    </div>
  );
}
