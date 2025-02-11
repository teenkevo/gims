"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

const InfoRowSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Skeleton className="h-2 mb-1 w-20" />
    <Skeleton className="h-5 w-28" />
  </motion.div>
);

export default function Loading() {
  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
      <Skeleton className=" h-8 w-32" />
      {/* Tabs Skeleton */}
      <Tabs defaultValue="in-progress">
        <div className="flex items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex h-9 p-1 space-x-2 border rounded-lg shadow-sm bg-white dark:bg-[#0c0c0c]"
          >
            <Skeleton className="w-24" />
            <Skeleton className="w-24" />
            <Skeleton className="w-16" />
          </motion.div>
        </div>

        {/* Project List Skeleton */}
        <TabsContent value="in-progress">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 gap-4 mt-5 lg:grid-cols-1"
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="border rounded-lg shadow-sm p-6"
              >
                {/* Card Header */}
                <div className="pb-6 space-y-2">
                  <Skeleton className="h-7 w-full" /> {/* Project Name */}
                  <Skeleton className="h-5 w-1/4" /> {/* Client Name */}
                </div>

                {/* Card Content */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 mb-6">
                  {/* InfoBlock Skeletons */}
                  <InfoRowSkeleton />
                  <InfoRowSkeleton />
                  <InfoRowSkeleton />
                  <InfoRowSkeleton />
                </div>

                {/* Divider */}
                <Skeleton className="mb-4 mt-10 h-[2px] w-full bg-muted" />

                {/* Card Footer */}
                <div className="flex justify-between items-center">
                  <div className="flex-col">
                    <Skeleton className="h-4 w-16 mb-2" /> {/* Stage Label */}
                    <div className="flex space-x-1">
                      {/* Stage Progress Skeleton */}
                      {Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton key={index} className="h-1 w-5 rounded" />
                      ))}
                    </div>
                  </div>
                  {/* Button Skeleton */}
                  <Skeleton className="h-8 w-32 rounded-md" /> {/* Button */}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
