import express from "express";
import validateRequest from "../../../middlewares/validateRequest";
import { clientAuth, userAuth } from "../../../middlewares/auth";
import {
  checkDebriefSubmission,
  createNewDailyDebrief,
  createNewDailyDebriefByRigAdmin,
  getAllActiveDebrief,
  getAllActiveDebriefByAdmin,
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

router.post(
  "/client/create",
  clientAuth(),
  validateRequest(createDailyDebriefZodSchema),
  createNewDailyDebriefByRigAdmin,
);

router.get("/get-active-debrief", userAuth(), getAllActiveDebrief);
router.get("/client/get-active-debrief", clientAuth(), getAllActiveDebriefByAdmin);
router.get("/check", userAuth(), checkDebriefSubmission);
router.get("/all", clientAuth(), getAllDebriefCardSubmission);

export const DailyDebriefRoutes = router;
