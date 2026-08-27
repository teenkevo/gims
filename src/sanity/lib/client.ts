import { createClient, QueryParams } from "next-sanity";

import { getAppBaseUrl } from "@/lib/app-url";
import { apiVersion, dataset, projectId } from "../env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Set to false if statically generating pages, using ISR or tag-based revalidation
  stega: {
    studioUrl: `${getAppBaseUrl()}/studio`,
  },
});

export async function sanityFetch<const QueryString extends string>({
  query,
  params = {},
  revalidate = 0, // default revalidation time in seconds
  tags = [],
}: {
  query: QueryString;
  params?: QueryParams;
  revalidate?: number | false;
  tags?: string[];
}) {
  return client.fetch(query, params, {
    next: {
      revalidate: tags.length ? false : revalidate, // for simple, time-based revalidation
      tags, // for tag-based revalidation
    },
  });
}
