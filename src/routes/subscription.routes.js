import { Router } from "express";
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes (no authentication required)
router.get("/channel/:channelId", getUserChannelSubscribers);
router.get("/user/:subscriberId", getSubscribedChannels);

// Protected routes
router.post("/toggle/:channelId", verifyJWT, toggleSubscription);

export default router; 