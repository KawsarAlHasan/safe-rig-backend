import express from "express";
import {
  adminAuth,
  clientAuth,
  rigAdminAuth,
  userAuth,
} from "../../middlewares/auth";
import {
  clientCompanyAnalysis,
  clientDashboardOverview,
  exportCompanyOverallAnalysisReport,
  exportDashboardReport,
  getAdminDashboardOverview,
  getRigAreaTypeHazard,
  globalStatus,
} from "./global.controller";

const router = express.Router();

// ───── Admin Routes ─────
router.patch("/admin/status-change", adminAuth(), globalStatus);
router.get("/admin/dashboard-overview", adminAuth(), getAdminDashboardOverview);

// ───── Client Routes ─────
router.get("/client/dashboard-overview", clientAuth(), clientDashboardOverview);
router.get("/client/company-analysis", clientAuth(), clientCompanyAnalysis);
router.patch("/client/status-change", clientAuth(), globalStatus);
router.get("/rig-area-hazard-type", clientAuth(), getRigAreaTypeHazard);

router.get("/client/dashboard-report", clientAuth(), exportDashboardReport);
router.get(
  "/client/company-overall-analysis-report",
  clientAuth(),
  exportCompanyOverallAnalysisReport,
);

export const GlobalRoutes = router;
