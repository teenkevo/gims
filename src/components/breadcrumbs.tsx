"use client";

import React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { capitalizeWords } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

type TBreadCrumbProps = {
  separator: React.ReactNode;
  containerClasses?: string;
  listClasses?: string;
  activeClasses?: string;
  capitalizeLinks?: boolean;
};

const NextBreadcrumb = ({
  separator,
  containerClasses,
  listClasses,
  activeClasses,
  capitalizeLinks,
}: TBreadCrumbProps) => {
  const paths = usePathname();
  const pathNames = paths
    .split("/")
    .filter((path) => path && path !== "dashboard");
  const searchParams = useSearchParams();
  const isDashboard = paths === "/dashboard";

  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Define mappings of path segments to query params
  const pathToQueryParam: Record<string, string> = {
    projects: "project",
    clients: "client",
  };

  return (
    <div>
      <ul className={containerClasses}>
        <li className={isDashboard ? activeClasses : listClasses}>
          <Link href={"/dashboard"}>Dashboard</Link>
        </li>
        {pathNames.length > 0 && separator}
        {pathNames.map((link, index) => {
          const isLast = index === pathNames.length - 1;
          const parentSegment = pathNames[index - 1]; // e.g. 'clients' or 'projects'
          const href = `/${pathNames.slice(0, index + 1).join("/")}`;

          let displayText = capitalizeLinks
            ? link[0].toUpperCase() + link.slice(1)
            : link;

          // 🔄  Run for *any* link that follows a mapped parent segment
          if (parentSegment && pathToQueryParam[parentSegment]) {
            const queryParam = pathToQueryParam[parentSegment]; // 'client' or 'project'
            const queryValue = searchParams.get(queryParam);
            if (queryValue) {
              const maxLength = isDesktop ? 40 : 4;
              displayText =
                queryValue.length > maxLength
                  ? capitalizeWords(queryValue.slice(0, maxLength) + "…")
                  : capitalizeWords(queryValue);
            }
          }

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
