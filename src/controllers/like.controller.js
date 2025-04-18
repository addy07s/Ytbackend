import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    
    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }
    
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    
    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    
    // Check if user has already liked the video
    const existingLike = await Like.findOne({
        video: videoId,
        likedby: req.user._id
    });
    
    if (existingLike) {
        // Unlike the video
        await Like.findByIdAndDelete(existingLike._id);
        
        return res.status(200).json(
            new ApiResponse(200, { liked: false }, "Video unliked successfully")
        );
    } else {
        // Like the video
        const like = await Like.create({
            video: videoId,
            likedby: req.user._id
        });
        
        return res.status(200).json(
            new ApiResponse(200, { liked: true }, "Video liked successfully")
        );
    }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    
    if (!commentId) {
        throw new ApiError(400, "Comment ID is required");
    }
    
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }
    
    // Check if comment exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }
    
    // Check if user has already liked the comment
    const existingLike = await Like.findOne({
        comment: commentId,
        likedby: req.user._id
    });
    
    if (existingLike) {
        // Unlike the comment
        await Like.findByIdAndDelete(existingLike._id);
        
        return res.status(200).json(
            new ApiResponse(200, { liked: false }, "Comment unliked successfully")
        );
    } else {
        // Like the comment
        const like = await Like.create({
            comment: commentId,
            likedby: req.user._id
        });
        
        return res.status(200).json(
            new ApiResponse(200, { liked: true }, "Comment liked successfully")
        );
    }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    
    if (!tweetId) {
        throw new ApiError(400, "Tweet ID is required");
    }
    
    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }
    
    // Check if tweet exists
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }
    
    // Check if user has already liked the tweet
    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedby: req.user._id
    });
    
    if (existingLike) {
        // Unlike the tweet
        await Like.findByIdAndDelete(existingLike._id);
        
        return res.status(200).json(
            new ApiResponse(200, { liked: false }, "Tweet unliked successfully")
        );
    } else {
        // Like the tweet
        const like = await Like.create({
            tweet: tweetId,
            likedby: req.user._id
        });
        
        return res.status(200).json(
            new ApiResponse(200, { liked: true }, "Tweet liked successfully")
        );
    }
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    
    const likes = await Like.find({ 
        likedby: req.user._id,
        video: { $exists: true }
    })
    .populate({
        path: "video",
        select: "title thumbnail videoUrl views duration owner",
        populate: {
            path: "owner",
            select: "username fullName avatar"
        }
    })
    .sort({ createdAt: -1 })
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber);
    
    // Extract just the video data
    const likedVideos = likes.map(like => like.video).filter(Boolean);
    
    const totalLikedVideos = await Like.countDocuments({ 
        likedby: req.user._id,
        video: { $exists: true }
    });
    
    const totalPages = Math.ceil(totalLikedVideos / limitNumber);
    
    return res.status(200).json(
        new ApiResponse(200, {
            videos: likedVideos,
            totalVideos: totalLikedVideos,
            totalPages,
            page: pageNumber,
            limit: limitNumber
        }, "Liked videos fetched successfully")
    );
});

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}; 