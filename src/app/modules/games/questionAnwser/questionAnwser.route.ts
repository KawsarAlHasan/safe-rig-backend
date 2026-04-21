import express from "express";
import validateRequest from "../../../middlewares/validateRequest";
import { adminAuth, rigAdminAuth, userAuth } from "../../../middlewares/auth";
import { createNewQuestion, getAllQuestion } from "./questionAnwser.controller";
import { createQuestionZodSchema } from "./questionAnwser.validation";
import fileUploadHandler from "../../../middlewares/fileUploadHandler";

const router = express.Router();

router.post(
  "/create",
  adminAuth(),
  fileUploadHandler(),
  validateRequest(createQuestionZodSchema),
  createNewQuestion,
);

router.get("/all", adminAuth(), getAllQuestion);

// router.put(
//   "/client/update",
//   adminAuth(),
//   validateRequest(updateRigTypeZodSchema),
//   updateRigType,
// );

// router.patch(
//   "/client/update-status",
//   adminAuth(),
//   validateRequest(changeStatusZodSchema),
//   rigTypeStatusChange,
// );

// router.delete("/client/:id", adminAuth(), permanentDeleteRigType);

// // ───── RigAdmin Routes ─────
// router.get("/client", rigAdminAuth(), getRigTypes);

// // ───── User Routes ─────
// router.get("/", userAuth(), getRigTypes);

export const QuestionRoutes = router;
