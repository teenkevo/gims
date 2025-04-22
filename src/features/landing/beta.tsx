"use client";
import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Beta() {
  return (
    <>
      <div className="h-screen w-full flex items-center justify-center relative overflow-hidden bg-black">
        <motion.img
          src="https://res.cloudinary.com/teenkevo-cloud/image/upload/v1745288234/Screenshot_2025-04-22_at_4.14.49_AM_su0iy5.webp"
          className="h-full w-full object-cover absolute inset-0 [mask-image:radial-gradient(circle,transparent,black_60%)] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1 }}
        />
        <div className="flex flex-col gap-5 items-center justify-center">
          <div className="flex flex-row items-center justify-center">
            <h1 className="text-2xl md:text-5xl lg:text-7xl font-bold text-center text-white relative z-2 font-sans">
              GIMS by GETLAB
            </h1>
            <Badge variant="secondary" className="ml-5 text-primary">
              Beta
            </Badge>
          </div>

          <Button>
            <Link href="/projects">Test application</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
