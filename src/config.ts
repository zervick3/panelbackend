import "dotenv/config";

export const PORT = Number(process.env.PORT) || 4000;
export const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";
export const MAX_UPLOAD_SIZE_MB = Number(process.env.MAX_UPLOAD_SIZE_MB) || 5;

const LOCAL_CORS_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:8081",
  "http://localhost:19006",
  "http://127.0.0.1:8081",
  "exp://127.0.0.1:8081",
];

const configuredCorsOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const CORS_ORIGIN = [
  ...new Set([...LOCAL_CORS_ORIGINS, ...configuredCorsOrigins]),
];
