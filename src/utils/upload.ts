import multer from "multer";
import { MAX_UPLOAD_SIZE_MB } from "../config";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!/^image\/(jpe?g|png|webp|gif|svg\+xml)$/.test(file.mimetype)) {
      cb(new Error("Solo se permiten imágenes"));
      return;
    }
    cb(null, true);
  },
});
