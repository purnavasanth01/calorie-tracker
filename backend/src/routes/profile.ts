import { Router } from "express";
import { ensureAuth } from "../middleware/ensureAuth";
import { updateProfile } from "../controllers/profileController";

const router = Router();

router.put("/", ensureAuth, updateProfile);

export default router;
