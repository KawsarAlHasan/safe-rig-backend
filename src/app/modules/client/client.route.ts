import express from "express";
import {
  createNewRigAdmin,
  getAllRigAdmin,
  updateRigAdmin,
  deleteRigAdmin,
  adminProfile,
} from "./client.controller";
import { adminAuth, clientAuth } from "../../middlewares/auth";
const router = express.Router();

router.post("/create", clientAuth(), createNewRigAdmin);
router.get("/", clientAuth(), getAllRigAdmin);
router.put("/update", clientAuth(), updateRigAdmin);
router.delete("/:id", clientAuth(), deleteRigAdmin);

router.get("/profile", adminAuth(), adminProfile);

export const ClientRoutes = router;
