import { Router } from "express";
import { 
    toggleVideoLike, 
    toggleCommentLike, 
    toggleTweetLike, 
    getLikedVideos 
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// All like routes require authentication
router.use(verifyJWT);

// Toggle likes
router.post("/toggle/v/:videoId", toggleVideoLike);
router.post("/toggle/c/:commentId", toggleCommentLike);
router.post("/toggle/t/:tweetId", toggleTweetLike);

// Get user's liked videos
router.get("/videos", getLikedVideos);

export default router; 