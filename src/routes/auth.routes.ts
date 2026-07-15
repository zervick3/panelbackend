import { Router } from "express";
import * as authCtrl from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.post("/login", authCtrl.login);
router.get("/me", authMiddleware, authCtrl.me);

export default router;
