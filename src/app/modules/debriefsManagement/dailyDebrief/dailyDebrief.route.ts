import express from "express";
import validateRequest from "../../../middlewares/validateRequest";
import {
  adminAuth,
  clientAuth,
  rigAdminAuth,
  userAuth,
} from "../../../middlewares/auth";
import { createNewDailyDebrief } from "./dailyDebrief.controller";
import { createDailyDebriefZodSchema } from "./dailyDebrief.validation";

const router = express.Router();

router.post(
  "/create",
  userAuth(),
  validateRequest(createDailyDebriefZodSchema),
  createNewDailyDebrief,
);

export const DailyDebriefRoutes = router;
