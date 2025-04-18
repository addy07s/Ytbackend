import { Router } from "express";
import {
    getChannelStats,
    getChannelVideos
} from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All dashboard routes require authentication
router.use(verifyJWT);

router.get("/stats", getChannelStats);
router.get("/videos", getChannelVideos);

export default router; 