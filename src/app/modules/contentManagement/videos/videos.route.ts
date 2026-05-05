import express from "express";
import validateRequest from "../../../middlewares/validateRequest";
import {
  adminAuth,
  clientAuth,
  rigAdminAuth,
  userAuth,
} from "../../../middlewares/auth";
import {
  createNewVideo,
  deleteVideo,
  getAllUserVideos,
  getAllVideos,
  getSingleVideos,
  updateVideo,
} from "./videos.controller";
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

router.put(
  "/admin/update/:id",
  adminAuth(),
  uploadVideoWithThumbnail,
  updateVideo,
);

router.get("/admin", adminAuth(), getAllVideos);
router.delete("/admin/:id", adminAuth(), deleteVideo);

// ───── Client Routes ─────
router.post(
  "/client/create",
  clientAuth(),
  uploadVideoWithThumbnail,
  validateRequest(createVideoZodSchema),
  createNewVideo,
);
router.put(
  "/client/update/:id",
  clientAuth(),
  uploadVideoWithThumbnail,
  updateVideo,
);
router.delete("/client/:id", clientAuth(), deleteVideo);

// // ───── User Routes ─────
router.get("/single/:id", getSingleVideos);
router.get("/", userAuth(), getAllUserVideos);

export const VideosRoutes = router;
