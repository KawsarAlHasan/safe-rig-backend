import express from "express";
import {
  createNewRole,
  deleteRole,
  getAllRole,
  updateRole,
} from "./role.controller";
import validateRequest from "../../middlewares/validateRequest";
import {
  createAdminRoleZodSchema,
  updateAdminRoleZodSchema,
} from "./role.validation";
const router = express.Router();

router.post(
  "/create",
  validateRequest(createAdminRoleZodSchema),
  createNewRole,
);
router.get("/", getAllRole);
router.put("/update", validateRequest(updateAdminRoleZodSchema), updateRole);
router.delete("/delete/:id", deleteRole);

export const AdminRoleRoutes = router;
