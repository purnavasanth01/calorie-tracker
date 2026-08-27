import { Router } from "express";
import { ensureAuth } from "../middleware/ensureAuth";
import { createPrediction } from "../controllers/predictController";

const router = Router();

router.post("/", ensureAuth, createPrediction);

export default router;
