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
          const href = `/${pathNames.slice(0, index + 1).join("/")}`;

          let displayText = capitalizeLinks
            ? link[0].toUpperCase() + link.slice(1)
            : link;

          // Replace ID with query parameter value if available
          if (isLast && parentSegment && pathToQueryParam[parentSegment]) {
            const queryParam = pathToQueryParam[parentSegment];
            const queryValue = searchParams.get(queryParam);
            if (queryValue) {
              // Truncate long query value and add ellipsis
              const maxLength = 24; // Set your desired max length
              displayText =
                queryValue.length > maxLength
                  ? capitalizeWords(queryValue.slice(0, maxLength) + "...")
                  : capitalizeWords(queryValue);
            }
          }

          // Always preserve the original query parameters in the breadcrumb URL
          const queryParams = searchParams.toString();
          const fullHref = queryParams ? `${href}?${queryParams}` : href;

          return (
            <React.Fragment key={index}>
              <li className={paths === href ? activeClasses : listClasses}>
                <Link href={fullHref}>{displayText}</Link>
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
