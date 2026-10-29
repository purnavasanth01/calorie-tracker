import { Router } from "express";
import { signup, login, demo, logout, me } from "../controllers/authController";
import { asyncHandler } from "../middleware/asyncHandler";
import { authLimiter, demoLimiter } from "../middleware/rateLimits";

const router = Router();

router.post("/signup", authLimiter, asyncHandler(signup));
router.post("/login", authLimiter, login);
router.post("/demo", demoLimiter, asyncHandler(demo));
router.post("/logout", logout);
router.get("/me", me);

export default router;
