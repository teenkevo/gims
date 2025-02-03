"use client";

import React, { ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { capitalizeWords } from "@/lib/utils";

type TBreadCrumbProps = {
  homeElement: ReactNode;
  separator: ReactNode;
  containerClasses?: string;
  listClasses?: string;
  activeClasses?: string;
  capitalizeLinks?: boolean;
};

const NextBreadcrumb = ({
  homeElement,
  separator,
  containerClasses,
  listClasses,
  activeClasses,
  capitalizeLinks,
}: TBreadCrumbProps) => {
  const paths = usePathname();
  const pathNames = paths.split("/").filter((path) => path);

  const searchParams = useSearchParams();

  // Define mappings of path segments to query params
  const pathToQueryParam: Record<string, string> = {
    projects: "project",
    clients: "client",
    orders: "order",
  };

  return (
    <div>
      <ul className={containerClasses}>
        <li className={listClasses}>
          <Link href={"/projects"}>{homeElement}</Link>
        </li>
        {pathNames.length > 0 && separator}
        {pathNames.map((link, index) => {
          const isLast = index === pathNames.length - 1;
          const parentSegment = pathNames[index - 1]; // Previous segment (e.g., 'clients')

          let displayText = capitalizeLinks
            ? link[0].toUpperCase() + link.slice(1)
            : link;

          // Check if the parent segment has a query parameter mapping
          if (isLast && parentSegment && pathToQueryParam[parentSegment]) {
            const queryParam = pathToQueryParam[parentSegment];
            const queryValue = searchParams.get(queryParam);
            if (queryValue) {
              displayText = capitalizeWords(queryValue); // Replace ID with query param value
            }
          }

          const href = `/${pathNames.slice(0, index + 1).join("/")}`;
          const itemClasses = paths === href ? activeClasses : listClasses;

          return (
            <React.Fragment key={index}>
              <li className={itemClasses}>
                <Link href={href}>{displayText}</Link>
              </li>
              {!isLast && separator}
            </React.Fragment>
          );
        })}
      </ul>
    </div>
  );
};

export default NextBreadcrumb;
