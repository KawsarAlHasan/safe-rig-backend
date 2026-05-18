import express from "express";
import validateRequest from "../../../middlewares/validateRequest";
import {
  getGameSchedule,
  getGameScheduleForAdmin,
  getLeaderboard,
  getLeaderboardForClientAndAdmin,
  puzzleSubmit,
  questionSubmit,
  saveGameSchedule,
} from "./gameSchedule.controller";
import {
  gameScheduleZodSchema,
  puzzleSubmitZodSchema,
} from "./gameSchedule.validation";
import { adminAuth, clientAuth, userAuth } from "../../../middlewares/auth";
const router = express.Router();

router.post("/save", saveGameSchedule);
router.get("/leaderboard", userAuth(), getLeaderboard);
router.get(
  "/leaderboard/client",
  clientAuth(),
  getLeaderboardForClientAndAdmin,
);
router.get("/leaderboard/admin", adminAuth(), getLeaderboardForClientAndAdmin);
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
