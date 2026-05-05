import express from "express";
import validateRequest from "../../../middlewares/validateRequest";
import {
  adminAuth,
  clientAuth,
  rigAdminAuth,
  userAuth,
} from "../../../middlewares/auth";
import {
  createNewAlert,
  deleteAlert,
  getAllAlerts,
  updateAlert,
} from "./alert.controller";
import { createAlertZodSchema } from "./alert.validation";
import fileUploadHandler from "../../../middlewares/fileUploadHandler";

const router = express.Router();

// ───── Admin Routes ─────
router.post(
  "/admin/create",
  adminAuth(),
  fileUploadHandler(),
  validateRequest(createAlertZodSchema),
  createNewAlert,
);
router.get("/admin", adminAuth(), getAllAlerts);

router.put("/admin/update/:id", adminAuth(), fileUploadHandler(), updateAlert);

router.delete("/admin/:id", adminAuth(), deleteAlert);

// ───── Client Routes ─────
router.post(
  "/client/create",
  clientAuth(),
  fileUploadHandler(),
  validateRequest(createAlertZodSchema),
  createNewAlert,
);
router.get("/client", clientAuth(), getAllAlerts);

router.put("/client/update/:id", adminAuth(), fileUploadHandler(), updateAlert);

router.delete("/client/:id", clientAuth(), deleteAlert);

export const AlertRoutes = router;
