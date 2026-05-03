import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { userAuth } from "../../middlewares/auth";
import {
  checkCardSubmission,
  createNewCardSubmission,
  getAllUserTypeAreaHazard,
} from "./cardSubmission.controller";
import { createCardSubmissionZodSchema } from "./cardSubmission.validation";
import { imageOrVideoUploadHandler } from "../../middlewares/imageOrVideoUploadHandler";

const router = express.Router();

router.post(
  "/create",
  userAuth(),
  imageOrVideoUploadHandler(),
  createNewCardSubmission,
);

router.get("/type-hazard-area", userAuth(), getAllUserTypeAreaHazard);
router.get("/check", userAuth(), checkCardSubmission);

export const CardSubmissionRoutes = router;
