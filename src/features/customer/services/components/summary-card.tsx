import { Button } from "@/components/ui/button";
import { CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import React from "react";
import { CreateStandardDialog } from "./create-standard";
import { PlusCircleIcon } from "lucide-react";

export default function SummaryCard({
  icon,
  title,
  description,
  footer,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  footer?: React.ReactNode;
}) {
  return (
    <div className="bg-gradient-to-b from-muted/20 to-muted/40 rounded-xl border">
      <CardHeader className="flex flex-row gap-4 rounded-t-xl bg-gradient-to-b from-black/90 to-black/80 dark:from-white dark:to-zinc-300 py-2">
        {icon}
        <div>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white dark:text-black leading-tight">
              {title}
            </h2>
          </div>
          <CardDescription className="mt-1 text-muted">
            {description}
          </CardDescription>
        </div>
      </CardHeader>

      <CardFooter className="p-4 pt-4 border-t flex justify-between">
        {footer}
      </CardFooter>
    </div>
  );
}
