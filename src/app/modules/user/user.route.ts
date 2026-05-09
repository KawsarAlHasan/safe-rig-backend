import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import {
  clientResendCodeZodSchema,
  profileUpdateCodeZodSchema,
} from "./user.validation";
import {
  getAllUsers,
  requestClientAndRig,
  requestClientAndRigAccept,
  userProfile,
  userUpdateProfile,
} from "./user.controller";
import { adminAuth, clientAuth, userAuth } from "../../middlewares/auth";
import fileUploadHandler from "../../middlewares/fileUploadHandler";
const router = express.Router();

router.post(
  "/with-rigs",
  userAuth({ checkApproval: false }),
  validateRequest(clientResendCodeZodSchema),
  requestClientAndRig,
);

router.get("/profile", userAuth({ checkApproval: false }), userProfile);

router.put(
  "/update",
  userAuth(),
  fileUploadHandler(),
  validateRequest(profileUpdateCodeZodSchema),
  userUpdateProfile,
);

router.put("/request-accept", requestClientAndRigAccept);

router.get("/admin", adminAuth(), getAllUsers);
router.get("/client", clientAuth(), getAllUsers);

export const UserRoutes = router;
