import express from "express";
import validateRequest from "../../middlewares/validateRequest";
// import {
//   createNewAdmin,
//   getAllAdmin,
//   updateAdmin,
//   deleteAdmin,
//   adminStatusChange,
// } from "./admin.controller";
// import {
//   createAdminZodSchema,
//   updateAdminStatusZodSchema,
//   updateAdminZodSchema,
// } from "./admin.validation";
import { createNewCompany } from "./company.controller";
import { createCompanyZodSchema } from "./company.validation";
const router = express.Router();

router.post(
  "/create",
  validateRequest(createCompanyZodSchema),
  createNewCompany,
);
// router.get("/", getAllAdmin);
// router.patch("/update", validateRequest(updateAdminZodSchema), updateAdmin);
// router.patch("/update-status", adminStatusChange);
// router.delete("/:id", deleteAdmin);

export const CompanyRoutes = router;
