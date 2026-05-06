import express from "express";
import {
  adminAuth,
  clientAuth,
  rigAdminAuth,
  userAuth,
} from "../../middlewares/auth";
import { getRigAreaTypeHazard, globalStatus } from "./global.controller";

const router = express.Router();

// ───── Admin Routes ─────
router.patch("/admin/status-change", adminAuth(), globalStatus);

// ───── Client Routes ─────
router.patch("/client/status-change", clientAuth(), globalStatus);
router.get("/rig-area-hazard-type", clientAuth(), getRigAreaTypeHazard);

export const GlobalRoutes = router;
