import express from "express";
import { createCoupon, deleteCoupon, getAllCoupon } from "./coupon.controller";
import { adminAuth } from "../../../middlewares/auth";

const router = express.Router();

router.post("/create", adminAuth(), createCoupon);
router.get("/", getAllCoupon);
router.delete("/:id", deleteCoupon);

export const CouponRoutes = router;
