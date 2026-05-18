import express from "express";
import validateRequest from "../../../middlewares/validateRequest";
import {
  loginZodSchema,
  resendCodeZodSchema,
  setPasswordZodSchema,
  signupZodSchema,
  verifyEmailZodSchema,
} from "./userAuth.validation";
import {
  forgotPassword,
  permanentDeleteUser,
  resendCode,
  setPassword,
  signUpNewUser,
  userLogin,
  verifyEmailOtp,
  verifyOtp,
} from "./userAuth.controller";
const router = express.Router();

router.post("/signup", validateRequest(signupZodSchema), signUpNewUser);
router.post(
  "/verify-email",
  validateRequest(verifyEmailZodSchema),
  verifyEmailOtp,
);
router.post("/resend-code", validateRequest(resendCodeZodSchema), resendCode);

// sign in
router.post("/signin", validateRequest(loginZodSchema), userLogin);

router.post(
  "/forgot-password",
  validateRequest(resendCodeZodSchema),
  forgotPassword,
);

router.post(
  "/verify-otp",
  validateRequest(verifyEmailZodSchema),
  verifyOtp,
);

router.post(
  "/set-password",
  validateRequest(setPasswordZodSchema),
  setPassword,
);

router.delete("/:id", permanentDeleteUser);

export const UserAuthRoutes = router;
