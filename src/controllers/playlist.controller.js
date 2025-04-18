import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    
    if (!name || name.trim() === "") {
        throw new ApiError(400, "Playlist name is required");
    }
    
    // Create the playlist
    const playlist = await Playlist.create({
        name,
        description: description || "",
        owner: req.user._id,
        videos: []
    });
    
    return res.status(201).json(
        new ApiResponse(201, playlist, "Playlist created successfully")
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    
    if (!userId) {
        throw new ApiError(400, "User ID is required");
    }
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }
    
    const playlists = await Playlist.find({ owner: userId })
        .populate("owner", "username fullName")
        .populate({
            path: "videos",
            select: "title thumbnail duration views",
            populate: {
                path: "owner",
                select: "username fullName avatar"
            }
        });
    
    return res.status(200).json(
        new ApiResponse(200, playlists, "User playlists fetched successfully")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    
    if (!playlistId) {
        throw new ApiError(400, "Playlist ID is required");
    }
    
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }
    
    const playlist = await Playlist.findById(playlistId)
        .populate("owner", "username fullName avatar")
        .populate({
            path: "videos",
            select: "title thumbnail duration views owner createdAt",
            populate: {
                path: "owner",
                select: "username fullName avatar"
            }
        });
    
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    
    return res.status(200).json(
        new ApiResponse(200, playlist, "Playlist fetched successfully")
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    
    if (!playlistId || !videoId) {
        throw new ApiError(400, "Playlist ID and Video ID are required");
    }
    
    if (!mongoose.Types.ObjectId.isValid(playlistId) || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID");
    }
    
    // Check if playlist exists and user is the owner
    const playlist = await Playlist.findById(playlistId);
    
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to modify this playlist");
    }
    
    // Check if video exists
    const video = await Video.findById(videoId);
    
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    
    // Check if video is already in the playlist
    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video already exists in the playlist");
    }
    
    // Add video to playlist
    playlist.videos.push(videoId);
    await playlist.save();
    
    return res.status(200).json(
        new ApiResponse(200, playlist, "Video added to playlist successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    
    if (!playlistId || !videoId) {
        throw new ApiError(400, "Playlist ID and Video ID are required");
    }
    
    if (!mongoose.Types.ObjectId.isValid(playlistId) || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID");
    }
    
    // Check if playlist exists and user is the owner
    const playlist = await Playlist.findById(playlistId);
    
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to modify this playlist");
    }
    
    // Check if video is in the playlist
    if (!playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video does not exist in the playlist");
    }
    
    // Remove video from playlist
    playlist.videos = playlist.videos.filter(vid => vid.toString() !== videoId);
    await playlist.save();
    
    return res.status(200).json(
        new ApiResponse(200, playlist, "Video removed from playlist successfully")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    
    if (!playlistId) {
        throw new ApiError(400, "Playlist ID is required");
    }
    
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }
    
    // Check if playlist exists and user is the owner
    const playlist = await Playlist.findById(playlistId);
    
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this playlist");
    }
    
    // Delete the playlist
    await Playlist.findByIdAndDelete(playlistId);
    
    return res.status(200).json(
        new ApiResponse(200, {}, "Playlist deleted successfully")
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;
    
    if (!playlistId) {
        throw new ApiError(400, "Playlist ID is required");
    }
    
    if (!name || name.trim() === "") {
        throw new ApiError(400, "Playlist name is required");
    }
    
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }
    
    // Check if playlist exists and user is the owner
    const playlist = await Playlist.findById(playlistId);
    
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this playlist");
    }
    
    // Update the playlist
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name,
                description: description || ""
            }
        },
        { new: true }
    );
    
    return res.status(200).json(
        new ApiResponse(200, updatedPlaylist, "Playlist updated successfully")
    );
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}; 