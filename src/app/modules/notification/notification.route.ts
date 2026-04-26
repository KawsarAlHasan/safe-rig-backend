import express from "express";
import {
  adminAuth,
  clientAuth,
  rigAdminAuth,
  userAuth,
} from "../../middlewares/auth";
import { changeToRead, getUserNotification } from "./notification.controller";

const router = express.Router();

router.get("/my", userAuth(), getUserNotification);
router.patch("/:id", userAuth(), changeToRead);

export const NotificationRoutes = router;
