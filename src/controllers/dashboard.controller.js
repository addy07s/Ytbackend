import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const getChannelStats = asyncHandler(async (req, res) => {
    // Get stats for the user's channel
    const userId = req.user._id;
    
    // Total subscribers
    const totalSubscribers = await Subscription.countDocuments({
        chanel: userId
    });
    
    // Total videos
    const totalVideos = await Video.countDocuments({
        owner: userId
    });
    
    // Total views across all videos
    const videoStats = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" }
            }
        }
    ]);
    
    const totalViews = videoStats[0]?.totalViews || 0;
    
    // Total likes on videos
    const totalLikes = await Like.countDocuments({
        video: { $in: await Video.find({ owner: userId }).select('_id') }
    });
    
    // Total comments on videos
    const totalComments = await Comment.countDocuments({
        video: { $in: await Video.find({ owner: userId }).select('_id') }
    });
    
    return res.status(200).json(
        new ApiResponse(200, {
            totalSubscribers,
            totalVideos,
            totalViews,
            totalLikes,
            totalComments
        }, "Channel stats fetched successfully")
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    // Get all videos for the user's channel
    const userId = req.user._id;
    const { page = 1, limit = 10, sortBy = "createdAt", sortType = "desc" } = req.query;
    
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    
    const sort = { [sortBy]: sortType === "desc" ? -1 : 1 };
    
    const videos = await Video.find({ owner: userId })
        .sort(sort)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .select("title description thumbnail views duration createdAt");
    
    const totalVideos = await Video.countDocuments({ owner: userId });
    const totalPages = Math.ceil(totalVideos / limitNumber);
    
    return res.status(200).json(
        new ApiResponse(200, {
            videos,
            totalVideos,
            totalPages,
            page: pageNumber,
            limit: limitNumber
        }, "Channel videos fetched successfully")
    );
});

export {
    getChannelStats,
    getChannelVideos
};