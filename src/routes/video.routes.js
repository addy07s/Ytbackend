import { Router } from "express";
import { 
    uploadVideo,
    getVideoById,
    getAllVideos,
    updateVideo,
    deleteVideo,
    togglePublishStatus
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.js";

const router = Router();

// Public routes
router.get("/", getAllVideos);
router.get("/:videoId", getVideoById);

// Protected routes
router.use(verifyJWT);

// Video upload with multer
router.post(
    "/", 
    upload.single("videoFile"), 
    uploadVideo
);

// Update video with optional thumbnail upload
router.patch(
    "/:videoId", 
    upload.single("thumbnail"), 
    updateVideo
);

router.delete("/:videoId", deleteVideo);
router.patch("/toggle/publish/:videoId", togglePublishStatus);

export default router; 