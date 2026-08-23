import { revalidateTag } from "next/cache";
import { writeClient } from "@/sanity/lib/write-client";
import { buildSeedDocuments } from "./documents";
import { SEED_PREFIX } from "./ids";

const MUTATION_CHUNK = 250;

const REVALIDATE_TAGS = [
  "projects",
  "quotation",
  "labs",
  "personnel",
  "clients",
  "sampleReviewTemplate",
  "sampleAdequacyTemplate",
];

async function commitChunks(
  docs: ReturnType<typeof buildSeedDocuments>,
  mode: "upsert" | "delete"
) {
  for (let i = 0; i < docs.length; i += MUTATION_CHUNK) {
    const chunk = docs.slice(i, i + MUTATION_CHUNK);
    const tx = writeClient.transaction();
    for (const doc of chunk) {
      if (mode === "delete") {
        tx.delete(doc._id);
      } else {
        tx.createOrReplace(doc);
      }
    }
    await tx.commit({ autoGenerateArrayKeys: true });
  }
}

export async function listSeedDocuments() {
  return writeClient.fetch<Array<{ _id: string; _type: string }>>(
    `*[_id match $pattern]{ _id, _type }`,
    { pattern: `${SEED_PREFIX}*` }
  );
}

export async function deleteSeedData() {
  const existing = await listSeedDocuments();
  if (existing.length === 0) {
    return { deleted: 0 };
  }

  for (let i = 0; i < existing.length; i += MUTATION_CHUNK) {
    const chunk = existing.slice(i, i + MUTATION_CHUNK);
    const tx = writeClient.transaction();
    for (const doc of chunk) {
      tx.delete(doc._id);
    }
    await tx.commit();
  }

  return { deleted: existing.length };
}

export async function seedDatabase(options?: { reset?: boolean }) {
  if (options?.reset) {
    await deleteSeedData();
  }

  const documents = buildSeedDocuments();
  await commitChunks(documents, "upsert");

  for (const tag of REVALIDATE_TAGS) {
    revalidateTag(tag);
  }

  const byType = documents.reduce<Record<string, number>>((acc, doc) => {
    acc[doc._type] = (acc[doc._type] ?? 0) + 1;
    return acc;
  }, {});

  return {
    count: documents.length,
    reset: Boolean(options?.reset),
    byType,
  };
}
