"use client";
import { Button } from "@/components/ui/button";
import { PlusCircleIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";

export default function NoProjectPlaceholder() {
  return (
    <motion.div
      className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-4"
      initial={{ opacity: 0, y: 10 }} // Start hidden and slightly below
      animate={{ opacity: 1, y: 0 }} // Fade in and slide up
      transition={{ duration: 0.1, ease: "easeOut" }} // Control the speed of the animation
    >
      <div className="flex flex-col items-center gap-1 text-center">
        <Image
          src="https://res.cloudinary.com/teenkevo-cloud/image/upload/v1729396365/404_m7a5fy.svg"
          width="0"
          height="0"
          priority
          alt="Success Icon"
          className="w-full h-auto md:mb-4"
        />
        <h3 className="text-2xl font-bold tracking-tight">Project Not Found</h3>
        <p className="text-sm text-muted-foreground">
          The project you are looking for has been deleted or does not exist.
        </p>
        <div className="mx-4 my-2">
          <Button asChild className="sm:w-auto" variant="default">
            <Link href="/projects" className="my-2">
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Go Back to Projects
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
