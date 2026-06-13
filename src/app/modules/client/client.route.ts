import express from "express";
import {
  createNewRigAdmin,
  getAllRigAdmin,
  updateRigAdmin,
  deleteRigAdmin,
  adminProfile,
  updateClientProfile,
  updatePassword,
} from "./client.controller";
import { adminAuth, clientAuth } from "../../middlewares/auth";
import { uploadProfilePicAndLogo } from "../../middlewares/fileUploader";
const router = express.Router();

router.post("/create", clientAuth(), createNewRigAdmin);
router.get("/", clientAuth(), getAllRigAdmin);
router.put("/update", clientAuth(), updateRigAdmin);
router.put(
  "/update-profile",
  uploadProfilePicAndLogo,
  clientAuth(),
  updateClientProfile,
);
router.put("/change-password", clientAuth(), updatePassword);
router.delete("/:id", clientAuth(), deleteRigAdmin);

router.get("/profile", adminAuth(), adminProfile);

export const ClientRoutes = router;
