import { Hono } from "hono";
import { deleteSeedData, listSeedDocuments, seedDatabase } from "@/lib/seed/run";

function isAuthorized(secretFromRequest: string | undefined) {
  const expected = process.env.SEED_SECRET;
  if (expected) {
    return secretFromRequest === expected;
  }
  return process.env.NODE_ENV !== "production";
}

function getSecret(c: { req: { header: (name: string) => string | undefined; query: (name: string) => string | undefined } }) {
  return (
    c.req.header("x-seed-secret") ??
    c.req.header("authorization")?.replace(/^Bearer\s+/i, "") ??
    c.req.query("secret")
  );
}

const app = new Hono()
  .get("/", async (c) => {
    if (!isAuthorized(getSecret(c))) {
      return c.json({ error: "Unauthorized. Set SEED_SECRET or call from development." }, 401);
    }

    const existing = await listSeedDocuments();
    const byType = existing.reduce<Record<string, number>>((acc, doc) => {
      acc[doc._type] = (acc[doc._type] ?? 0) + 1;
      return acc;
    }, {});

    return c.json({
      seeded: existing.length,
      byType,
      usage: {
        seed: "POST /api/seed",
        reset: "POST /api/seed?reset=1",
        clear: "DELETE /api/seed",
        header: "x-seed-secret: <SEED_SECRET>",
      },
    });
  })
  .post("/", async (c) => {
    if (!isAuthorized(getSecret(c))) {
      return c.json({ error: "Unauthorized. Set SEED_SECRET or call from development." }, 401);
    }

    const reset =
      c.req.query("reset") === "1" ||
      c.req.query("reset") === "true";

    const result = await seedDatabase({ reset });
    return c.json({ ok: true, ...result });
  })
  .delete("/", async (c) => {
    if (!isAuthorized(getSecret(c))) {
      return c.json({ error: "Unauthorized. Set SEED_SECRET or call from development." }, 401);
    }

    const result = await deleteSeedData();
    return c.json({ ok: true, ...result });
  });

export default app;
