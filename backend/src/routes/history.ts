import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { listHistory, exportHistory, getDashboardSummary, deletePrediction } from "../controllers/historyController";

const router = Router();

router.get("/", asyncHandler(listHistory));
router.get("/export", asyncHandler(exportHistory));
router.get("/summary", asyncHandler(getDashboardSummary));
router.delete("/:id", asyncHandler(deletePrediction));

export default router;
