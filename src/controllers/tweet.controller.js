import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Tweet content is required");
    }
    
    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    });
    
    const createdTweet = await Tweet.findById(tweet._id).populate("owner", "username fullName avatar");
    
    if (!createdTweet) {
        throw new ApiError(500, "Something went wrong while creating the tweet");
    }
    
    return res.status(201).json(
        new ApiResponse(201, createdTweet, "Tweet created successfully")
    );
});

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    if (!userId) {
        throw new ApiError(400, "User ID is required");
    }
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }
    
    // Check if the user exists
    const user = await User.findById(userId);
    
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    
    const tweets = await Tweet.find({ owner: userId })
        .populate("owner", "username fullName avatar")
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);
    
    const totalTweets = await Tweet.countDocuments({ owner: userId });
    const totalPages = Math.ceil(totalTweets / limitNumber);
    
    return res.status(200).json(
        new ApiResponse(200, {
            tweets,
            totalTweets,
            totalPages,
            page: pageNumber,
            limit: limitNumber
        }, "User tweets fetched successfully")
    );
});

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;
    
    if (!tweetId) {
        throw new ApiError(400, "Tweet ID is required");
    }
    
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Tweet content is required");
    }
    
    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }
    
    const tweet = await Tweet.findById(tweetId);
    
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }
    
    // Check if the user is the owner of the tweet
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet");
    }
    
    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { $set: { content } },
        { new: true }
    ).populate("owner", "username fullName avatar");
    
    if (!updatedTweet) {
        throw new ApiError(500, "Something went wrong while updating the tweet");
    }
    
    return res.status(200).json(
        new ApiResponse(200, updatedTweet, "Tweet updated successfully")
    );
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    
    if (!tweetId) {
        throw new ApiError(400, "Tweet ID is required");
    }
    
    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }
    
    const tweet = await Tweet.findById(tweetId);
    
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }
    
    // Check if the user is the owner of the tweet
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet");
    }
    
    await Tweet.findByIdAndDelete(tweetId);
    
    return res.status(200).json(
        new ApiResponse(200, {}, "Tweet deleted successfully")
    );
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}; 