import cors from "cors";
import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";

import authRoutes from "./routes/auth.routes";
import tiendasRoutes from "./routes/tiendas.routes";
import { CORS_ORIGIN, UPLOAD_DIR } from "./config";
import { prisma } from "./db";

const app = express();

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.resolve(UPLOAD_DIR)));

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.get("/api/health/ready", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      ok: true,
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      ok: false,
      database: "disconnected",
      timestamp: new Date().toISOString(),
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/tiendas", tiendasRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Recurso no encontrado" });
});

export default app;
