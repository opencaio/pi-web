import { buildApp } from "./app.js";

const app = await buildApp();
const port = Number(process.env["PI_WEB_PORT"] ?? process.env["PORT"] ?? 3000);
const host = process.env["PI_WEB_HOST"] ?? "127.0.0.1";
await app.listen({ port, host });
