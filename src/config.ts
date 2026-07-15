import "dotenv/config";

export const PORT = Number(process.env.PORT) || 4000;
export const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";
export const MAX_UPLOAD_SIZE_MB = Number(process.env.MAX_UPLOAD_SIZE_MB) || 5;
export const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
