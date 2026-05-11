import express from "express";
import { adminAuth, clientAuth } from "../../middlewares/auth";

import {
  areaDefineHeatmap,
  createNewHeatmap,
  getAllHeatmaps,
  getSingleHeatmap,
  heatmapStatusChange,
} from "./heatmaps.controller";
import fileUploadHandler from "../../middlewares/fileUploadHandler";

const router = express.Router();

// ───── Admin Routes ─────
router.post(
  "/admin/create",
  adminAuth(),
  fileUploadHandler(),
  createNewHeatmap,
);

router.patch("/area-define", adminAuth(), areaDefineHeatmap);
router.patch("/admin/status-change", adminAuth(), heatmapStatusChange);

router.get("/admin/all", adminAuth(), getAllHeatmaps);
router.get("/single/:id", getSingleHeatmap);

// // ───── Client Routes ─────
router.post(
  "/client/create",
  clientAuth(),
  fileUploadHandler(),
  createNewHeatmap,
);

router.get("/client/all", clientAuth(), getAllHeatmaps);

export const HeatmapsRoutes = router;
