import { Router } from "express";
import { ensureAuth } from "../middleware/ensureAuth";
import { createCheckoutSession, verifyCheckoutSession, handleWebhook } from "../controllers/paymentController";

const router = Router();

router.post("/create-checkout-session", ensureAuth, createCheckoutSession);
router.get("/verify/:sessionId", ensureAuth, verifyCheckoutSession);

export const webhookHandler = handleWebhook;

export default router;
