import express from "express";
import validateRequest from "../../../middlewares/validateRequest";
import {
  adminAuth,
  clientAuth,
  rigAdminAuth,
  userAuth,
} from "../../../middlewares/auth";
import {
  createNewHazard,
  getAllUserHazard,
  getHazards,
  hazardStatusChange,
  permanentDeleteHazard,
  updateHazard,
} from "./hazard.controller";
import {
  changeStatusZodSchema,
  createHazardZodSchema,
  updateHazardZodSchema,
} from "./hazard.validation";

const router = express.Router();

// ───── Admin Routes ─────
router.post(
  "/admin/create",
  adminAuth(),
  validateRequest(createHazardZodSchema),
  createNewHazard,
);

router.get("/admin", adminAuth(), getHazards);

router.put(
  "/admin/update",
  adminAuth(),
  validateRequest(updateHazardZodSchema),
  updateHazard,
);

router.patch(
  "/admin/update-status",
  adminAuth(),
  validateRequest(changeStatusZodSchema),
  hazardStatusChange,
);

router.delete("/admin/:id", adminAuth(), permanentDeleteHazard);

// ───── Client Routes ─────
router.post(
  "/client/create",
  clientAuth(),
  validateRequest(createHazardZodSchema),
  createNewHazard,
);

router.get("/client", clientAuth(), getHazards);

router.put(
  "/client/update",
  clientAuth(),
  validateRequest(updateHazardZodSchema),
  updateHazard,
);

router.patch(
  "/client/update-status",
  clientAuth(),
  validateRequest(changeStatusZodSchema),
  hazardStatusChange,
);

router.delete("/client/:id", clientAuth(), permanentDeleteHazard);

// ───── RigAdmin Routes ─────
router.get("/client", rigAdminAuth(), getHazards);

// ───── User Routes ─────
router.get("/", userAuth(), getAllUserHazard);

export const HazardRoutes = router;
