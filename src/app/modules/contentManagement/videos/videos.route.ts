import express from "express";
import validateRequest from "../../../middlewares/validateRequest";
import {
  adminAuth,
  clientAuth,
  rigAdminAuth,
  userAuth,
} from "../../../middlewares/auth";
import { createNewVideo, getAllUserVideos, getSingleVideos } from "./videos.controller";
import { createVideoZodSchema } from "./videos.validation";
import { uploadVideoWithThumbnail } from "../../../middlewares/fileUploader";

const router = express.Router();

// ───── Admin Routes ─────
router.post(
  "/admin/create",
  adminAuth(),
  uploadVideoWithThumbnail,
  validateRequest(createVideoZodSchema),
  createNewVideo,
);

// router.get("/admin", adminAuth(), getRigTypes);

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
  uploadVideoWithThumbnail,
  validateRequest(createVideoZodSchema),
  createNewVideo,
);

// router.get("/client", clientAuth(), getRigTypes);

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

// // ───── User Routes ─────
router.get("/single/:id", getSingleVideos);
router.get("/", userAuth(), getAllUserVideos);

export const VideosRoutes = router;
