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

const SEED_DOC_FILTER =
  "string::startsWith(_id, $prefix) || string::startsWith(_id, $draftPrefix)";

const seedIdParams = {
  prefix: SEED_PREFIX,
  draftPrefix: `drafts.${SEED_PREFIX}`,
};

function rawClient() {
  return writeClient.withConfig({ perspective: "raw" });
}

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

async function deleteByIds(ids: string[]) {
  for (let i = 0; i < ids.length; i += MUTATION_CHUNK) {
    const chunk = ids.slice(i, i + MUTATION_CHUNK);
    const tx = writeClient.transaction();
    for (const id of chunk) {
      tx.delete(id);
    }
    await tx.commit();
  }
}

function revalidateSeedCaches() {
  for (const tag of REVALIDATE_TAGS) {
    revalidateTag(tag);
  }
}

export async function listSeedDocuments() {
  return rawClient().fetch<Array<{ _id: string; _type: string }>>(
    `*[${SEED_DOC_FILTER}]{ _id, _type }`,
    seedIdParams
  );
}

async function listDocumentsReferencing(ids: string[]) {
  if (ids.length === 0) {
    return [];
  }

  return rawClient().fetch<Array<{ _id: string; _type: string }>>(
    `*[references(*[_id in $ids]._id) && !(_id in $ids)]{ _id, _type }`,
    { ids }
  );
}

export async function deleteSeedData() {
  const existing = await listSeedDocuments();
  const seedIds = new Set(existing.map((doc) => doc._id));
  const seedLabIds = existing
    .filter((doc) => doc._type === "lab")
    .map((doc) => doc._id);

  const labBlockers = (await listDocumentsReferencing(seedLabIds)).filter(
    (doc) => !seedIds.has(doc._id)
  );

  const ids = [
    ...labBlockers.map((doc) => doc._id),
    ...existing.filter((doc) => doc._type !== "lab").map((doc) => doc._id),
    ...seedLabIds,
  ];
  const uniqueIds = [...new Set(ids)];

  if (uniqueIds.length === 0) {
    revalidateSeedCaches();
    return { deleted: 0, labs: 0, unblocked: 0 };
  }

  await deleteByIds(uniqueIds);
  revalidateSeedCaches();

  return {
    deleted: uniqueIds.length,
    labs: seedLabIds.length,
    unblocked: labBlockers.length,
  };
}

export async function seedDatabase(options?: { reset?: boolean }) {
  if (options?.reset) {
    await deleteSeedData();
  }

  const documents = buildSeedDocuments();
  await commitChunks(documents, "upsert");
  revalidateSeedCaches();

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
