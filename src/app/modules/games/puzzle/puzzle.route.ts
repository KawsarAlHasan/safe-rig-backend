import express from "express";
import validateRequest from "../../../middlewares/validateRequest";
import { adminAuth, rigAdminAuth, userAuth } from "../../../middlewares/auth";
import fileUploadHandler from "../../../middlewares/fileUploadHandler";
import { createNewPuzzle, getAllPuzzles, permanentDeletePuzzle } from "./puzzle.controller";

const router = express.Router();

router.post(
  "/create",
  adminAuth(),
  fileUploadHandler(),
  // validateRequest(createQuestionZodSchema),
  createNewPuzzle,
);

// router.get("/all", adminAuth(), getAllPuzzles);
router.get("/all", getAllPuzzles);

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

router.delete("/delete/:id", adminAuth(), permanentDeletePuzzle);

// // ───── RigAdmin Routes ─────
// router.get("/client", rigAdminAuth(), getRigTypes);

// // ───── User Routes ─────
// router.get("/", userAuth(), getRigTypes);

export const PuzzleRoutes = router;
