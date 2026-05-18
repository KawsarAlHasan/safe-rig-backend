import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import {
  adminAuth,
  clientAuth,
  rigAdminAuth,
  userAuth,
} from "../../middlewares/auth";
import { createRigZodSchema, updateRigZodSchema } from "./rig.validation";
import {
  createNewRig,
  fleetComparison,
  getRigs,
  permanentDeleteRig,
  updateRig,
} from "./rig.controller";

const router = express.Router();

// ───── Admin Routes ─────
router.post(
  "/admin/create",
  adminAuth(),
  validateRequest(createRigZodSchema),
  createNewRig,
);

router.get("/admin", adminAuth(), getRigs);

router.put(
  "/admin/update",
  adminAuth(),
  validateRequest(updateRigZodSchema),
  updateRig,
);

router.delete("/admin/:id", adminAuth(), permanentDeleteRig);

// ───── Client Routes ─────
router.post(
  "/client/create",
  clientAuth(),
  validateRequest(createRigZodSchema),
  createNewRig,
);

router.post("/fleet-comparison", clientAuth(), fleetComparison);

router.get("/client", clientAuth(), getRigs);

router.put(
  "/client/update",
  clientAuth(),
  validateRequest(updateRigZodSchema),
  updateRig,
);

router.delete("/client/:id", clientAuth(), permanentDeleteRig);

// ───── RigAdmin Routes ─────
router.get("/client", rigAdminAuth(), getRigs);

// ───── User Routes ─────
router.get("/", userAuth(), getRigs);

export const RigRoutes = router;
