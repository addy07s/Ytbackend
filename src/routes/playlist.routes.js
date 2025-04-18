import { Router } from "express";
import { 
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Get playlist by ID (public)
router.get("/:playlistId", getPlaylistById);
router.get("/user/:userId", getUserPlaylists);

// Protected routes
router.use(verifyJWT);

// Playlist CRUD operations
router.post("/", createPlaylist);
router.patch("/:playlistId", updatePlaylist);
router.delete("/:playlistId", deletePlaylist);

// Video management in playlists
router.patch("/add/:playlistId/:videoId", addVideoToPlaylist);
router.patch("/remove/:playlistId/:videoId", removeVideoFromPlaylist);

export default router; 