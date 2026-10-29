import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { checkout } from "../controllers/paymentController";

const router = Router();

router.post("/checkout", asyncHandler(checkout));

export default router;
