import express from "express";
import { subscriptionBuy } from "./subscription.controller";
import { clientAuth } from "../../../middlewares/auth";

const router = express.Router();

router.post("/buy", clientAuth(), subscriptionBuy);

export const SubscriptionRoutes = router;
