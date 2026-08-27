import { Router } from "express";
import { ensureAuth } from "../middleware/ensureAuth";
import { listHistory, exportHistory, getDashboardSummary } from "../controllers/historyController";

const router = Router();

router.get("/", ensureAuth, listHistory);
router.get("/export", ensureAuth, exportHistory);
router.get("/summary", ensureAuth, getDashboardSummary);

export default router;
