import express from "express";
import validateRequest from "../../../middlewares/validateRequest";
import {
  adminAuth,
  clientAuth,
  rigAdminAuth,
  userAuth,
} from "../../../middlewares/auth";
import {
  createNewArea,
  getAllUserArea,
  getArea,
  getAreaByRig,
} from "./area.controller";
import { createAreaZodSchema } from "./area.validation";

const router = express.Router();

// // ───── Admin Routes ─────
// router.post(
//   "/admin/create",
//   adminAuth(),
//   validateRequest(createRigTypeZodSchema),
//   createNewRigType,
// );

router.get("/admin", adminAuth(), getArea);
router.get("/admin/singlerig", adminAuth(), getAreaByRig);

// router.put(
//   "/admin/update",
//   adminAuth(),
//   validateRequest(updateRigTypeZodSchema),
//   updateRigType,
// );

// router.patch(
//   "/admin/update-status",
//   adminAuth(),
//   validateRequest(changeStatusZodSchema),
//   rigTypeStatusChange,
// );

// router.delete("/admin/:id", adminAuth(), permanentDeleteRigType);

// ───── Client Routes ─────
router.post(
  "/client/create",
  clientAuth(),
  validateRequest(createAreaZodSchema),
  createNewArea,
);

router.get("/client", clientAuth(), getArea);
router.get("/client/:id", clientAuth(), getAreaByRig);

// router.put(
//   "/client/update",
//   clientAuth(),
//   validateRequest(updateRigTypeZodSchema),
//   updateRigType,
// );

// router.patch(
//   "/client/update-status",
//   clientAuth(),
//   validateRequest(changeStatusZodSchema),
//   rigTypeStatusChange,
// );

// router.delete("/client/:id", clientAuth(), permanentDeleteRigType);

// // ───── RigAdmin Routes ─────
// router.get("/client", rigAdminAuth(), getRigTypes);

// ───── User Routes ─────
router.get("/", userAuth(), getAllUserArea);

export const AreaRoutes = router;
