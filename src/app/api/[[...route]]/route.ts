import { Hono } from "hono";
import { handle } from "hono/vercel";
import project from "@/features/internal/projects/server/route";
import client from "@/features/customer/clients/server/route";

const app = new Hono().basePath("/api");

const projectRoutes = app.route("/projects", project);
const clientRoutes = app.route("/clients", client);

export const GET = handle(app);
export const POST = handle(app);

export type ProjectAppType = typeof projectRoutes;
export type ClientAppType = typeof clientRoutes;
export type AppType = ProjectAppType | ClientAppType;
