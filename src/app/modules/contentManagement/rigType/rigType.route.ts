import express from "express";

import validateRequest from "../../../middlewares/validateRequest";
import { rigTypeCreateService } from "./rigType.service";
import { createRigTypeZodSchema } from "./rigType.validation";
const router = express.Router();

router.post(
  "/create",
  validateRequest(createRigTypeZodSchema),
  rigTypeCreateService,
);
// router.get("/", getAllRole);
// router.put("/update", validateRequest(updateAdminRoleZodSchema), updateRole);
// router.delete("/delete/:id", deleteRole);

export const RigTypeRoutes = router;
