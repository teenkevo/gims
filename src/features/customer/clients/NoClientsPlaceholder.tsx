import { Button } from "@/components/ui/button";
import { PlusCircleIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";

export default function NoClientsPlaceholder({
  helperText,
  needAction,
}: {
  helperText?: string;
  needAction?: boolean;
}) {
  return (
    <motion.div
      className="flex flex-1 items-center justify-center h-[72vh] rounded-lg border border-dashed shadow-sm p-4"
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
            className="w-full h-auto md:mb-4"
          />
        )}
        <h3 className="text-2xl font-bold tracking-tight">
          You have no {helperText}
        </h3>
        {needAction && (
          <>
            <p className="text-sm text-muted-foreground">
              Let&apos;s start off with creating a client.
            </p>

            <div className="mx-4 my-2">
              <Button asChild className="sm:w-auto" variant="default">
                <Link href="/projects/create" className="my-2">
                  <PlusCircleIcon className="h-5 w-5 mr-2" />
                  Create New Client
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
