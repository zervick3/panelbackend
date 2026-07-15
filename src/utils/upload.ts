import multer from "multer";
import path from "path";
import crypto from "crypto";
import { UPLOAD_DIR, MAX_UPLOAD_SIZE_MB } from "../config";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safe = crypto.randomBytes(8).toString("hex");
    cb(null, `${Date.now()}-${safe}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!/^image\/(jpe?g|png|webp|gif|svg\+xml)$/.test(file.mimetype)) {
      cb(new Error("Solo se permiten imágenes"));
      return;
    }
    cb(null, true);
  },
});
