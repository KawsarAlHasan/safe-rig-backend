import express from "express";
import validateRequest from "../../../middlewares/validateRequest";
import {
  adminAuth,
  clientAuth,
  rigAdminAuth,
  userAuth,
} from "../../../middlewares/auth";
import {
  createRigTypeZodSchema,
  updateRigTypeZodSchema,
} from "./rigType.validation";
import {
  createNewRigType,
  getRigTypes,
  permanentDeleteRigType,
  updateRigType,
} from "./rigType.controller";

const router = express.Router();

// ───── Admin Routes ─────
router.post(
  "/admin/create",
  adminAuth(),
  validateRequest(createRigTypeZodSchema),
  createNewRigType,
);

router.get("/admin", adminAuth(), getRigTypes);

router.put(
  "/admin/update",
  adminAuth(),
  validateRequest(updateRigTypeZodSchema),
  updateRigType,
);

router.delete("/admin/:id", adminAuth(), permanentDeleteRigType);

// ───── Client Routes ─────
router.post(
  "/client/create",
  clientAuth(),
  validateRequest(createRigTypeZodSchema),
  createNewRigType,
);

router.get("/client", clientAuth(), getRigTypes);

router.put(
  "/client/update",
  clientAuth(),
  validateRequest(updateRigTypeZodSchema),
  updateRigType,
);

router.delete("/client/:id", clientAuth(), permanentDeleteRigType);

// ───── RigAdmin Routes ─────
router.get("/client", rigAdminAuth(), getRigTypes);

// ───── User Routes ─────
router.get("/", userAuth(), getRigTypes);

export const RigTypeRoutes = router;
