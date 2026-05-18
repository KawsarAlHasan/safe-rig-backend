import express from "express";
import {
  adminAuth,
  clientAuth,
  rigAdminAuth,
  userAuth,
} from "../../../middlewares/auth";
import {
  createNewDebriefQuestion,
  getDebriefQuestion,
  permanentDeleteDebriefQuestion,
  updateDebriefQuestion,
} from "./debriefQuestion.controller";

const router = express.Router();

// ───── Admin Routes ─────
router.post("/admin/create", adminAuth(), createNewDebriefQuestion);
router.get("/admin", adminAuth(), getDebriefQuestion);
router.put("/admin/update", adminAuth(), updateDebriefQuestion);
router.delete("/admin/:id", adminAuth(), permanentDeleteDebriefQuestion);

// ───── Client Routes ─────
router.post("/client/create", clientAuth(), createNewDebriefQuestion);
router.get("/client", clientAuth(), getDebriefQuestion);
router.put("/client/update", clientAuth(), updateDebriefQuestion);
router.delete("/client/:id", clientAuth(), permanentDeleteDebriefQuestion);

export const DebriefQuestionRoutes = router;
