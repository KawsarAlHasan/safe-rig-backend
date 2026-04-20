import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import {
  companyStatusChange,
  createNewCompany,
  getAllCompany,
  getAllCompanyWithRigs,
  permanentDeleteCompany,
  updateCompany,
} from "./company.controller";
import { companyZodSchema } from "./company.validation";
const router = express.Router();

router.post(
  "/create",
  validateRequest(companyZodSchema),
  createNewCompany,
);
router.get("/with-rigs", getAllCompanyWithRigs);
router.get("/", getAllCompany);
router.put("/update", validateRequest(companyZodSchema), updateCompany);
router.patch("/update-status", companyStatusChange);
router.delete("/:id", permanentDeleteCompany);

export const CompanyRoutes = router;
