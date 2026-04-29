import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import {
  adminAuth,
  clientAuth,
  rigAdminAuth,
  userAuth,
} from "../../middlewares/auth";
import {
  changeStatusZodSchema,
  createRigZodSchema,
  updateRigZodSchema,
} from "./heatmaps.validation";
import {
  areaDefineHeatmap,
  createNewHeatmap,
  getAllHeatmaps,
  getSingleHeatmap,
} from "./heatmaps.controller";
import fileUploadHandler from "../../middlewares/fileUploadHandler";

const router = express.Router();

// ───── Admin Routes ─────
router.post(
  "/admin/create",
  adminAuth(),
  // validateRequest(createRigZodSchema),
  fileUploadHandler(),
  createNewHeatmap,
);

router.patch("/area-define", adminAuth(), areaDefineHeatmap);

router.get("/admin/all", adminAuth(), getAllHeatmaps);
router.get("/single/:id", getSingleHeatmap);

// // ───── Client Routes ─────
router.post(
  "/client/create",
  clientAuth(),
  // validateRequest(createRigZodSchema),
  fileUploadHandler(),
  createNewHeatmap,
);

export const HeatmapsRoutes = router;
