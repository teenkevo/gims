import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface InfoCardProps {
  title: string;
  description?: string;
  learnMoreLink?: string;
  learnMoreText?: string;
  savable: boolean;
  children: React.ReactNode;
}

// TODO: Refactor under single-field-form
export function InfoCard({
  title,
  description,
  learnMoreLink,
  learnMoreText,
  savable,
  children,
}: InfoCardProps) {
  return (
    <div className="border rounded-lg ">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {description && <p className="text-sm mb-4">{description}</p>}
        {children}
        <div className="mt-6 -mx-6 -mb-6 px-6 py-4 flex rounded-b-xl bg-muted/50 justify-between border-t items-center">
          <span className="text-sm sm:flex">
            Learn more about
            <a
              href={undefined}
              className="text-primary text-sm flex items-center hover:underline sm:ml-1"
            >
              {title}
              <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          </span>
          {savable && <Button variant="outline">Save</Button>}
        </div>
      </CardContent>
    </div>
  );
}
