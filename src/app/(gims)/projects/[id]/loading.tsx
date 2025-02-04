"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeftCircle } from "lucide-react";
import Link from "next/link";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";

const InfoRowSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
    className="col-span-2 p-6 border rounded-lg shadow-sm bg-white dark:bg-[#0c0c0c]"
  >
    <Skeleton className="h-8 w-40 mb-10" />
    <Skeleton className="h-5 w-full mb-2" />
    <Skeleton className="h-5 w-3/4 mb-7" />
    <Skeleton className="h-6 w-32" />
  </motion.div>
);

const AttachmentCardSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
    className="flex items-center space-x-2 bg-white border-2 p-3 rounded-md shadow-sm"
  >
    <Skeleton className="w-16 h-16" />
    <div>
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-3 w-16 mt-1" />
    </div>
  </motion.div>
);

export default function Loading() {
  return (
    <>
      <Link className="mb-10 inline-flex" href="/projects">
        <ArrowLeftCircle className="mr-5 text-primary" />
        Go back
      </Link>

      <div className="flex justify-between items-start mb-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
          className="space-y-3 mb-6"
        >
          <Skeleton className="h-7 w-48 md:h-9 md:w-64" />
          <Skeleton className="h-6 w-32 md:h-7 md:w-40" />
        </motion.div>
      </div>

      <Tabs defaultValue="details">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="flex h-9 p-1 max-w-lg space-x-2 border rounded-lg shadow-sm bg-white dark:bg-[#0c0c0c]"
        >
          <Skeleton className="w-16" />
          <Skeleton className="w-14" />
          <Skeleton className="w-16" />
          <Skeleton className="w-24" />
          <Skeleton className="w-14" />
        </motion.div>

        <TabsContent value="details">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 my-10"
          >
            <InfoRowSkeleton />
            <InfoRowSkeleton />
          </motion.div>
        </TabsContent>

        <TabsContent value="client">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 my-10"
          >
            <InfoRowSkeleton />
            <InfoRowSkeleton />
          </motion.div>
        </TabsContent>

        <TabsContent value="billing">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 my-10"
          >
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-40 w-full" />
          </motion.div>
        </TabsContent>
      </Tabs>
    </>
  );
}
