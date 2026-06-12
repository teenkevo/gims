import { Button } from "@/components/ui/button";
import { PlusCircleIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";

export default function NoProjectsPlaceholder({
  helperText,
  description = "Let's start off with creating a project.",
  createHref = "/projects/create",
  needAction,
  className = "h-[72vh]",
}: {
  helperText?: string;
  description?: string;
  createHref?: string;
  needAction?: boolean;
  className?: string;
}) {
  return (
    <motion.div
      className={`flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-4 ${className}`}
      initial={{ opacity: 0, y: 10 }} // Start hidden and slightly below
      animate={{ opacity: 1, y: 0 }} // Fade in and slide up
      transition={{ duration: 0.1, ease: "easeOut" }} // Control the speed of the animation
    >
      <div className="flex flex-col items-center gap-1 text-center">
        {needAction && (
          <Image
            src="https://res.cloudinary.com/teenkevo-cloud/image/upload/v1714345451/hasura_new_project.72d74b03527711e12ed017d57b54ca79_jrvqju.svg"
            width="0"
            height="0"
            priority
            alt="Success Icon"
            className="mx-auto mb-2 h-auto w-48 max-w-[200px] md:mb-4 md:max-w-[300px]"
          />
        )}
        <h3 className="text-lg md:text-xl font-bold tracking-tight">
          You have no {helperText ?? "projects"}
        </h3>
        {needAction && (
          <>
            <p className="text-sm text-muted-foreground">{description}</p>

            <div className="mx-4 my-2">
              <Button asChild className="sm:w-auto" variant="default">
                <Link href={createHref} className="my-2">
                  <PlusCircleIcon className="h-5 w-5 mr-2" />
                  Create New Project
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
