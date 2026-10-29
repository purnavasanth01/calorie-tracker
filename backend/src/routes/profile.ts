import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { updateProfile } from "../controllers/profileController";

const router = Router();

router.put("/", asyncHandler(updateProfile));

export default router;
