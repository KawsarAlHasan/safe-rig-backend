import express from "express";
import { checkCoupon, createCoupon, deleteCoupon, getAllCoupon } from "./coupon.controller";
import { adminAuth } from "../../../middlewares/auth";

const router = express.Router();

router.post("/create", adminAuth(), createCoupon);
router.post("/check", checkCoupon);
router.get("/", getAllCoupon);
router.delete("/:id", deleteCoupon);

export const CouponRoutes = router;
