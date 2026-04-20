import express from "express";
import validateRequest from "../../../middlewares/validateRequest";
import { clientProfile, loginClient } from "./clientAuth.controller";
import { loginZodSchema } from "./clientAuth.validation";
import { clientAuth } from "../../../middlewares/auth";
const router = express.Router();

router.post("/login", validateRequest(loginZodSchema), loginClient);
router.get("/profile", clientAuth(), clientProfile);

// router.post(
//   '/forget-password',
//   validateRequest(AuthValidation.createForgetPasswordZodSchema),
//   AuthController.forgetPassword
// );

// router.post(
//   '/verify-email',
//   validateRequest(AuthValidation.createVerifyEmailZodSchema),
//   AuthController.verifyEmail
// );

// router.post(
//   '/reset-password',
//   validateRequest(AuthValidation.createResetPasswordZodSchema),
//   AuthController.resetPassword
// );

// router.post(
//   '/change-password',
//   auth(USER_ROLES.ADMIN, USER_ROLES.USER),
//   validateRequest(AuthValidation.createChangePasswordZodSchema),
//   AuthController.changePassword
// );

export const ClientAuthRoutes = router;
