import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { clientAuth, userAuth } from "../../middlewares/auth";
import {
  checkCardSubmission,
  createNewCardSubmission,
  getAllCardSubmission,
  getAllUserTypeAreaHazard,
  updateCardSubmission,
} from "./cardSubmission.controller";
import { createCardSubmissionZodSchema } from "./cardSubmission.validation";
import { imageOrVideoUploadHandler } from "../../middlewares/imageOrVideoUploadHandler";
import fileUploadHandler from "../../middlewares/fileUploadHandler";

const router = express.Router();

router.post(
  "/create",
  userAuth(),
  imageOrVideoUploadHandler(),
  createNewCardSubmission,
);

router.get("/type-hazard-area", userAuth(), getAllUserTypeAreaHazard);
router.get("/check", userAuth(), checkCardSubmission);
router.get("/all", clientAuth(), getAllCardSubmission);
router.patch(
  "/close-card/:id",
  fileUploadHandler(),
  clientAuth(),
  updateCardSubmission,
);

export const CardSubmissionRoutes = router;
