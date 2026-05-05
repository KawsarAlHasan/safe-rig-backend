import express from "express";
import {
  adminAuth,
  clientAuth,
  rigAdminAuth,
  userAuth,
} from "../../middlewares/auth";
import { globalStatus } from "./global.controller";

const router = express.Router();

// ───── Admin Routes ─────
router.patch("/admin/status-change", adminAuth(), globalStatus);

// ───── Client Routes ─────
router.patch("/client/status-change", clientAuth(), globalStatus);

export const GlobalRoutes = router;
