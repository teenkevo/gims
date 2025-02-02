import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId, sanityToken } from "../env";

export const backendClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Set to false if statically generating pages, using ISR or tag-based revalidation
  token: sanityToken,
});
