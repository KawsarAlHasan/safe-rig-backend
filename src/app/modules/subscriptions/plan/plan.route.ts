import express from "express";
import validateRequest from "../../../middlewares/validateRequest";
import { adminAuth, rigAdminAuth, userAuth } from "../../../middlewares/auth";
import fileUploadHandler from "../../../middlewares/fileUploadHandler";
import { createInitialPlan, getAllPlan, updatePlan } from "./plan.controller";

const router = express.Router();

router.post("/initialize", adminAuth(), createInitialPlan);
router.get("/", getAllPlan);
router.put("/update", updatePlan);

export const PlanRoutes = router;
