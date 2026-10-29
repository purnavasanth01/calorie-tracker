import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { listHistory, exportHistory, getDashboardSummary } from "../controllers/historyController";

const router = Router();

router.get("/", asyncHandler(listHistory));
router.get("/export", asyncHandler(exportHistory));
router.get("/summary", asyncHandler(getDashboardSummary));

export default router;
