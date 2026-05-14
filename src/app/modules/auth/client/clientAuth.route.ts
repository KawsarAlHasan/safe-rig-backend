import express from "express";
import validateRequest from "../../../middlewares/validateRequest";
import {
  clientProfile,
  createNewCompany,
  loginClient,
  resendClientCode,
  verifyClientEmailOtp,
} from "./clientAuth.controller";
import {
  companyZodSchema,
  loginZodSchema,
  resendCodeZodSchema,
  verifyEmailZodSchema,
} from "./clientAuth.validation";
import { clientAuth } from "../../../middlewares/auth";
const router = express.Router();

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

// // sign in
// router.post("/signin", validateRequest(loginZodSchema), userLogin);

// router.post(
//   "/forgot-password",
//   validateRequest(resendCodeZodSchema),
//   forgotPassword,
// );

// router.post(
//   "/verify-otp",
//   validateRequest(verifyEmailZodSchema),
//   verifyOtp,
// );

// router.post(
//   "/set-password",
//   validateRequest(setPasswordZodSchema),
//   setPassword,
// );

// router.delete("/:id", permanentDeleteUser);

export const ClientAuthRoutes = router;
