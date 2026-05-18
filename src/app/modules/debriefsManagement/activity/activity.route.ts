import express from "express";
import validateRequest from "../../../middlewares/validateRequest";
import {
  adminAuth,
  clientAuth,
  rigAdminAuth,
  userAuth,
} from "../../../middlewares/auth";
import {
  activityStatusChange,
  createNewActivity,
  getAllUserActivity,
  getActivity,
  permanentDeleteActivity,
  updateActivity,
} from "./activity.controller";
import {
  changeStatusZodSchema,
  createActivityZodSchema,
  updateActivityZodSchema,
} from "./activity.validation";

const router = express.Router();

// ───── Admin Routes ─────
router.post(
  "/admin/create",
  adminAuth(),
  validateRequest(createActivityZodSchema),
  createNewActivity,
);

router.get("/admin", adminAuth(), getActivity);

router.put(
  "/admin/update",
  adminAuth(),
  validateRequest(updateActivityZodSchema),
  updateActivity,
);

router.patch(
  "/admin/update-status",
  adminAuth(),
  validateRequest(changeStatusZodSchema),
  activityStatusChange,
);

router.delete("/admin/:id", adminAuth(), permanentDeleteActivity);

// ───── Client Routes ─────
router.post(
  "/client/create",
  clientAuth(),
  validateRequest(createActivityZodSchema),
  createNewActivity,
);

router.get("/client", clientAuth(), getActivity);

router.put(
  "/client/update",
  clientAuth(),
  validateRequest(updateActivityZodSchema),
  updateActivity,
);

router.patch(
  "/client/update-status",
  clientAuth(),
  validateRequest(changeStatusZodSchema),
  activityStatusChange,
);

router.delete("/client/:id", clientAuth(), permanentDeleteActivity);

// ───── RigAdmin Routes ─────
router.get("/client", rigAdminAuth(), getActivity);

// ───── User Routes ─────
router.get("/", userAuth(), getAllUserActivity);

export const ActivityRoutes = router;
