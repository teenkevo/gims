import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface ItemCardProps {
  title: string;
  description?: string;
  footerLeft?: React.ReactNode;
  footerRight?: React.ReactNode;
  children: React.ReactNode;
}

// TODO: Refactor under single-field-form
export function ItemCard({
  title,
  description,
  footerLeft,
  footerRight,
  children,
}: ItemCardProps) {
  return (
    <div className="border bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg ">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {description && <p className="text-sm mb-4">{description}</p>}
        {children}
        <div className="mt-6 -mx-6 -mb-6 px-3 py-2 flex rounded-b-lg bg-muted/50 justify-between border-t items-center">
          {footerLeft}
          <div className="flex gap-2">{footerRight}</div>
        </div>
      </CardContent>
    </div>
  );
}
