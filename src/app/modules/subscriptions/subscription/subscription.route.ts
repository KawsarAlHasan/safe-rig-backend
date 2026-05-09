import express from "express";
import { getMySubscription, subscriptionBuy } from "./subscription.controller";
import { clientAuth } from "../../../middlewares/auth";

const router = express.Router();

router.post("/buy", clientAuth(), subscriptionBuy);
router.get("/my", clientAuth(), getMySubscription);

export const SubscriptionRoutes = router;
