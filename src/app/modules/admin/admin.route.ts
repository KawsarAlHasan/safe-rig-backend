import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import {
  createNewAdmin,
  getAllAdmin,
  updateAdmin,
  deleteAdmin,
  adminProfile,
} from "./admin.controller";
import {
  createAdminZodSchema,
  updateAdminZodSchema,
} from "./admin.validation";
import { adminAuth } from "../../middlewares/auth";
const router = express.Router();

router.post("/create", validateRequest(createAdminZodSchema), createNewAdmin);
router.get("/", getAllAdmin);
router.patch("/update", validateRequest(updateAdminZodSchema), updateAdmin);
router.delete("/:id", deleteAdmin);

router.get("/profile", adminAuth(), adminProfile);

export const AdminRoutes = router;
