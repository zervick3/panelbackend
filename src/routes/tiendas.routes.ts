import { Router } from "express";
import * as tiendasCtrl from "../controllers/tiendas.controller";
import { authMiddleware } from "../middlewares/auth";
import { upload } from "../utils/upload";

const router = Router();

router.get("/", tiendasCtrl.list);
router.get("/:id", tiendasCtrl.getOne);
router.post("/", authMiddleware, upload.single("imagen"), tiendasCtrl.create);
router.put("/:id", authMiddleware, upload.single("imagen"), tiendasCtrl.update);
router.delete("/:id", authMiddleware, tiendasCtrl.remove);

export default router;

