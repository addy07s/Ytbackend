import { Router } from "express";
import {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.get("/user/:userId", getUserTweets);

// Protected routes
router.use(verifyJWT);

router.post("/", createTweet);
router.patch("/:tweetId", updateTweet);
router.delete("/:tweetId", deleteTweet);

export default router; 