"use client";

import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignInButton, useAuth } from "@clerk/nextjs";

export function Beta() {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <div className="h-screen w-full flex items-center justify-center relative overflow-hidden bg-black">
      <motion.img
        src="https://res.cloudinary.com/teenkevo-cloud/image/upload/v1745288234/Screenshot_2025-04-22_at_4.14.49_AM_su0iy5.webp"
        className="h-full w-full object-cover absolute inset-0 [mask-image:radial-gradient(circle,transparent,black_60%)] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1 }}
      />
      <div className="flex flex-col gap-10 items-center justify-center">
        <div className="flex flex-row items-center justify-center">
          <h1 className="text-2xl md:text-5xl lg:text-7xl font-bold text-center text-white relative z-2 font-sans">
            GIMS by GETLAB
          </h1>
          <Badge variant="secondary" className="ml-5 text-primary">
            Beta
          </Badge>
        </div>

        {!isLoaded ? (
          <Button disabled>Loading...</Button>
        ) : isSignedIn ? (
          <div className="relative inline-block">
            <Button asChild>
              <Link href="/projects">Go to App</Link>
            </Button>
            <Badge
              variant="secondary"
              className="absolute -top-4 -right-12 text-primary pointer-events-none"
            >
              Signed in
            </Badge>
          </div>
        ) : (
          <SignInButton mode="redirect" forceRedirectUrl="/projects">
            <Button>Test application</Button>
          </SignInButton>
        )}
      </div>
    </div>
  );
}
