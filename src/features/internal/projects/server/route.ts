import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { projectDetailsSchema } from "../schemas";

const app = new Hono().post(
  "/create",
  zValidator("json", projectDetailsSchema),

  async (c) => {
    // use c.req.valid only when using the zValidator middleware
    const body = c.req.valid;
    console.log(body);
    return c.json({ success: "ok" });
  }
);

export default app;
