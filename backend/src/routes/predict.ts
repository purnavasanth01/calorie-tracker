import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { createPrediction } from "../controllers/predictController";

const router = Router();

router.post("/", asyncHandler(createPrediction));

export default router;
