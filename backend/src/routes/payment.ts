import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { createCheckoutSession, verifyCheckoutSession, handleWebhook } from "../controllers/paymentController";

const router = Router();

router.post("/create-checkout-session", asyncHandler(createCheckoutSession));
router.get("/verify/:sessionId", asyncHandler(verifyCheckoutSession));

export const webhookHandler = asyncHandler(handleWebhook);

export default router;
