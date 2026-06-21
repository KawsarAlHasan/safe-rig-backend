import express from "express";
import validateRequest from "../../../middlewares/validateRequest";
import {
  clientProfile,
  createNewCompany,
  impersonateLogin,
  impersonateTokenGenerate,
  loginClient,
  resendClientCode,
  verifyClientEmailOtp,
} from "./clientAuth.controller";
import {
  companyZodSchema,
  impersonateZodSchema,
  loginZodSchema,
  resendCodeZodSchema,
  verifyEmailZodSchema,
} from "./clientAuth.validation";
import { adminAuth, clientAuth } from "../../../middlewares/auth";
const router = express.Router();

router.post("/impersonate", adminAuth(), impersonateTokenGenerate);
router.post(
  "/impersonate-login",
  validateRequest(impersonateZodSchema),
  impersonateLogin,
);
router.post("/login", validateRequest(loginZodSchema), loginClient);
router.get("/profile", clientAuth(), clientProfile);

router.post("/signup", validateRequest(companyZodSchema), createNewCompany);

router.post(
  "/verify-email",
  validateRequest(verifyEmailZodSchema),
  verifyClientEmailOtp,
);

router.post(
  "/resend-code",
  validateRequest(resendCodeZodSchema),
  resendClientCode,
);

export const ClientAuthRoutes = router;
