import express from "express";
import { clientAuth, userAuth } from "../../middlewares/auth";
import {
  getHomePage,
  getHomePageForClient,
  setHomeVideoAndImage,
} from "./app.controller";
const router = express.Router();

router.get("/home", userAuth({ checkApproval: true }), getHomePage);
router.get("/client/home", clientAuth(), getHomePageForClient);
router.post("/client/set", clientAuth(), setHomeVideoAndImage);

export const AppRoutes = router;
