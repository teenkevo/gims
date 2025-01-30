import { Hono } from "hono";
import { handle } from "hono/vercel";
import project from "@/features/internal/projects/server/route";

const app = new Hono().basePath("/api");

const routes = app.route("/projects", project);

export const GET = handle(app);
export const POST = handle(app);

export type AppType = typeof routes;
