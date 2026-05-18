import express from "express";
import {
  createNewRigAdmin,
  getAllRigAdmin,
  updateRigAdmin,
  deleteRigAdmin,
  adminProfile,
} from "./rigAdmin.controller";
import { adminAuth, clientAuth } from "../../middlewares/auth";
const router = express.Router();

router.post("/create", clientAuth(), createNewRigAdmin);
router.get("/", clientAuth(), getAllRigAdmin);
router.put("/update", clientAuth(), updateRigAdmin);
router.delete("/:id", clientAuth(), deleteRigAdmin);

router.get("/profile", adminAuth(), adminProfile);

export const RigAdminRoutes = router;
