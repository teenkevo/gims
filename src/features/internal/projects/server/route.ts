import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createProjectSchema } from "../schemas";

const app = new Hono().post(
  "/create",
  zValidator("json", createProjectSchema),

  async (c) => {
    // use c.req.valid only when using the zValidator middleware
    const {
      projectName,
      dateRange,
      clientType,
      existingClient,
      newClientEmail,
      newClientName,
      newClientPhone,
    } = c.req.valid("json");

    return c.json({
      projectName,
      dateRange,
      clientType,
      existingClient,
      newClientEmail,
      newClientName,
      newClientPhone,
    });
  }
);

export default app;
