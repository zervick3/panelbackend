import "dotenv/config";

export const PORT = Number(process.env.PORT) || 4000;
export const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";
export const MAX_UPLOAD_SIZE_MB = Number(process.env.MAX_UPLOAD_SIZE_MB) || 5;
export const CORS_ORIGIN = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
export const SUPABASE_URL = process.env.SUPABASE_URL || "";
export const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "";
export const SUPABASE_STORAGE_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET || "tiendas";
