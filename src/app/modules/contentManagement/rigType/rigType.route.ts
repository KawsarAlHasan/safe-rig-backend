import express from "express";

import validateRequest from "../../../middlewares/validateRequest";
import {
  createRigTypeZodSchema,
  updateRigTypeZodSchema,
} from "./rigType.validation";
import {
  createNewRigType,
  getRigTypes,
  permanentDeleteRigType,
  rigTypeStatusChange,
  updateRigType,
} from "./rigType.controller";
const router = express.Router();

router.post(
  "/create",
  validateRequest(createRigTypeZodSchema),
  createNewRigType,
);
router.get("/", getRigTypes);
router.put("/update", validateRequest(updateRigTypeZodSchema), updateRigType);
router.patch("/update-status", validateRequest(updateRigTypeZodSchema), rigTypeStatusChange);
router.delete("/:id", permanentDeleteRigType);

export const RigTypeRoutes = router;
