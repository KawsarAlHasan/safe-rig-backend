import express from "express";
import validateRequest from "../../../middlewares/validateRequest";
import { getGameSchedule, questionSubmit, saveGameSchedule } from "./gameSchedule.controller";
import { gameScheduleZodSchema } from "./gameSchedule.validation";
import { userAuth } from "../../../middlewares/auth";
const router = express.Router();

router.post("/save", validateRequest(gameScheduleZodSchema), saveGameSchedule);
router.get("/", userAuth(), getGameSchedule);
router.post("/question-submit", userAuth(), questionSubmit);

export const GameScheduleRoutes = router;
