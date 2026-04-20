import express from "express";
import { userAuth } from "../../middlewares/auth";
import { getHomePage } from "./app.controller";
const router = express.Router();

router.get("/home", userAuth({ checkApproval: true }), getHomePage);

export const AppRoutes = router;
