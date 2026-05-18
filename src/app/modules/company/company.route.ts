import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import {
  companyStatusChange,
  createNewCompany,
  getAllCompany,
  getAllCompanyWithRigs,
  getCompanyData,
  permanentDeleteCompany,
  updateCompany,
} from "./company.controller";
import { companyZodSchema } from "./company.validation";
import { clientAuth } from "../../middlewares/auth";
const router = express.Router();

router.post("/create", validateRequest(companyZodSchema), createNewCompany);
router.get("/with-rigs", getAllCompanyWithRigs);
router.get("/card-data", clientAuth(), getCompanyData); // for client
router.get("/", getAllCompany);
router.put("/update", validateRequest(companyZodSchema), updateCompany);
router.patch("/update-status", companyStatusChange);
router.delete("/:id", permanentDeleteCompany);

export const CompanyRoutes = router;
