import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import {
  createNewAdmin,
  getAllAdmin,
  updateAdmin,
  deleteAdmin,
  adminProfile,
  updateAdminProfile,
  updatePassword,
} from "./admin.controller";
import { createAdminZodSchema, updateAdminZodSchema } from "./admin.validation";
import { adminAuth } from "../../middlewares/auth";
import fileUploadHandler from "../../middlewares/fileUploadHandler";
const router = express.Router();

router.post("/create", validateRequest(createAdminZodSchema), createNewAdmin);
router.get("/", getAllAdmin);
router.patch("/update", validateRequest(updateAdminZodSchema), updateAdmin);
router.patch(
  "/update-profile",
  adminAuth(),
  fileUploadHandler(),
  updateAdminProfile,
);
router.delete("/:id", deleteAdmin);

router.get("/profile", adminAuth(), adminProfile);
router.put("/change-password", adminAuth(), updatePassword);

export const AdminRoutes = router;
