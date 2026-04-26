import express from "express";
import validateRequest from "../../../middlewares/validateRequest";
import {
  getGameSchedule,
  getGameScheduleForAdmin,
  getLeaderboard,
  puzzleSubmit,
  questionSubmit,
  saveGameSchedule,
} from "./gameSchedule.controller";
import {
  gameScheduleZodSchema,
  puzzleSubmitZodSchema,
} from "./gameSchedule.validation";
import { userAuth } from "../../../middlewares/auth";
const router = express.Router();

router.post("/save", saveGameSchedule);
router.get("/leaderboard", userAuth(), getLeaderboard);
router.post("/question-submit", userAuth(), questionSubmit);
router.post(
  "/puzzle-submit",
  userAuth(),
  validateRequest(puzzleSubmitZodSchema),
  puzzleSubmit,
);
router.get("/admin/:date", getGameScheduleForAdmin);
router.get("/", userAuth(), getGameSchedule);

export const GameScheduleRoutes = router;
