import express from "express";
import validateRequest from "../../../middlewares/validateRequest";
import { clientAuth, userAuth } from "../../../middlewares/auth";
import {
  checkDebriefSubmission,
  createNewDailyDebrief,
  getAllActiveDebrief,
  getAllDebriefCardSubmission,
} from "./dailyDebrief.controller";
import { createDailyDebriefZodSchema } from "./dailyDebrief.validation";

const router = express.Router();

router.post(
  "/create",
  userAuth(),
  validateRequest(createDailyDebriefZodSchema),
  createNewDailyDebrief,
);

router.get("/get-active-debrief", userAuth(), getAllActiveDebrief);
router.get("/check", userAuth(), checkDebriefSubmission);
router.get("/all", clientAuth(), getAllDebriefCardSubmission);

export const DailyDebriefRoutes = router;
