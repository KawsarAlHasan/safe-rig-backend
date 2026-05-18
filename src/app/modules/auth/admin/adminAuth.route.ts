import express from "express";
import validateRequest from "../../../middlewares/validateRequest";
import {
  adminLogin,
  forgotPassword,
  setPassword,
  verifyOtp,
} from "./adminAuth.controller";
import {
  loginZodSchema,
  resendCodeZodSchema,
  setPasswordZodSchema,
  verifyEmailZodSchema,
} from "./adminAuth.validation";
const router = express.Router();

// sign in
router.post("/signin", validateRequest(loginZodSchema), adminLogin);

router.post(
  "/forgot-password",
  validateRequest(resendCodeZodSchema),
  forgotPassword,
);

router.post("/verify-otp", validateRequest(verifyEmailZodSchema), verifyOtp);

router.post(
  "/set-password",
  validateRequest(setPasswordZodSchema),
  setPassword,
);

export const AdminAuthRoutes = router;
