import express from "express";
import validateRequest from "../../../middlewares/validateRequest";
import {
  adminAuth,
  clientAuth,
  rigAdminAuth,
  userAuth,
} from "../../../middlewares/auth";
import {
  createNewMessage,
  getMessages,
  permanentDeleteMessage,
  updateMessage,
} from "./messages.controller";
import fileUploadHandler from "../../../middlewares/fileUploadHandler";

const router = express.Router();

// ───── Admin Routes ─────
router.post(
  "/admin/create",
  adminAuth(),
  fileUploadHandler(),
  createNewMessage,
);

router.get("/admin", adminAuth(), getMessages);

router.put(
  "/admin/update/:id",
  adminAuth(),
  fileUploadHandler(),
  updateMessage,
);
router.delete("/admin/:id", adminAuth(), permanentDeleteMessage);

// ───── Client Routes ─────
router.post(
  "/client/create",
  clientAuth(),
  fileUploadHandler(),
  createNewMessage,
);

router.get("/client", clientAuth(), getMessages);

router.put(
  "/client/update/:id",
  clientAuth(),
  fileUploadHandler(),
  updateMessage,
);

router.delete("/client/:id", clientAuth(), permanentDeleteMessage);

export const MessageRoutes = router;
