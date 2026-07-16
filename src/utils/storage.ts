import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import {
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_STORAGE_BUCKET,
  SUPABASE_URL,
  UPLOAD_DIR,
} from "../config";

const storageBaseUrl = SUPABASE_URL.replace(/\/$/, "");
const supabase =
  storageBaseUrl && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(storageBaseUrl, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

function imageExtension(file: Express.Multer.File): string {
  const extension = path.extname(file.originalname).toLowerCase();
  if (/^\.(jpe?g|png|webp|gif|svg)$/.test(extension)) return extension;
  const byMimeType: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
  };
  return byMimeType[file.mimetype] || ".jpg";
}

export async function saveTiendaImage(
  file: Express.Multer.File,
  tiendaId: string
): Promise<string> {
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${imageExtension(file)}`;

  if (!supabase) {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.resolve(UPLOAD_DIR, filename), file.buffer);
    return `/uploads/${filename}`;
  }

  const safeId = tiendaId.replace(/[^a-zA-Z0-9_-]/g, "-");
  const objectPath = `${safeId}/${filename}`;
  const { error } = await supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .upload(objectPath, file.buffer, {
      cacheControl: "31536000",
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .getPublicUrl(objectPath);

  return data.publicUrl;
}

export async function deleteTiendaImage(imageUrl: string): Promise<void> {
  if (imageUrl.startsWith("/uploads/")) {
    await fs
      .unlink(path.resolve(UPLOAD_DIR, path.basename(imageUrl)))
      .catch(() => undefined);
    return;
  }

  if (!supabase) return;

  const prefix = `${storageBaseUrl}/storage/v1/object/public/${SUPABASE_STORAGE_BUCKET}/`;
  if (!imageUrl.startsWith(prefix)) return;

  const objectPath = decodeURIComponent(imageUrl.slice(prefix.length));
  const { error } = await supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .remove([objectPath]);

  if (error) console.error("[storage.remove]", error.message);
}
