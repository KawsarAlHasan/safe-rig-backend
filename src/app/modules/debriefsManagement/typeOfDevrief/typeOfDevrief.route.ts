import express from "express";
import validateRequest from "../../../middlewares/validateRequest";
import {
  adminAuth,
  clientAuth,
  rigAdminAuth,
  userAuth,
} from "../../../middlewares/auth";
import {
  cardTypeStatusChange,
  createNewCardType,
  getAllUserCardType,
  getCardType,
  permanentDeleteCardType,
  updateCardType,
} from "./cardType.controller";
import {
  changeStatusZodSchema,
  createCardTypeZodSchema,
  updateCardTypeZodSchema,
} from "./cardType.validation";

const router = express.Router();

// ───── Admin Routes ─────
router.post(
  "/admin/create",
  adminAuth(),
  validateRequest(createCardTypeZodSchema),
  createNewCardType,
);

router.get("/admin", adminAuth(), getCardType);

router.put(
  "/admin/update",
  adminAuth(),
  validateRequest(updateCardTypeZodSchema),
  updateCardType,
);

router.patch(
  "/admin/update-status",
  adminAuth(),
  validateRequest(changeStatusZodSchema),
  cardTypeStatusChange,
);

router.delete("/admin/:id", adminAuth(), permanentDeleteCardType);

// ───── Client Routes ─────
router.post(
  "/client/create",
  clientAuth(),
  validateRequest(createCardTypeZodSchema),
  createNewCardType,
);

router.get("/client", clientAuth(), getCardType);

router.put(
  "/client/update",
  clientAuth(),
  validateRequest(updateCardTypeZodSchema),
  updateCardType,
);

router.patch(
  "/client/update-status",
  clientAuth(),
  validateRequest(changeStatusZodSchema),
  cardTypeStatusChange,
);

router.delete("/client/:id", clientAuth(), permanentDeleteCardType);

// ───── User Routes ─────
router.get("/", userAuth(), getAllUserCardType);

export const TypeOfDevriefRoutes = router;
