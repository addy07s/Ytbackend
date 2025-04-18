import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    
    if (!channelId) {
        throw new ApiError(400, "Channel ID is required");
    }
    
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }
    
    // Check if the channel exists
    const channel = await User.findById(channelId);
    
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }
    
    // Cannot subscribe to yourself
    if (channel._id.toString() === req.user._id.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }
    
    // Check if already subscribed
    const existingSubscription = await Subscription.findOne({
        subscriber: req.user._id,
        chanel: channelId
    });
    
    if (existingSubscription) {
        // Unsubscribe
        await Subscription.findByIdAndDelete(existingSubscription._id);
        
        return res.status(200).json(
            new ApiResponse(200, { subscribed: false }, "Unsubscribed successfully")
        );
    } else {
        // Subscribe
        const subscription = await Subscription.create({
            subscriber: req.user._id,
            chanel: channelId
        });
        
        return res.status(200).json(
            new ApiResponse(200, { subscribed: true }, "Subscribed successfully")
        );
    }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    if (!channelId) {
        throw new ApiError(400, "Channel ID is required");
    }
    
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }
    
    // Check if the channel exists
    const channel = await User.findById(channelId);
    
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }
    
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    
    const subscriptions = await Subscription.find({ chanel: channelId })
        .populate("subscriber", "username fullName avatar")
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);
    
    const subscribers = subscriptions.map(sub => sub.subscriber);
    
    const totalSubscribers = await Subscription.countDocuments({ chanel: channelId });
    const totalPages = Math.ceil(totalSubscribers / limitNumber);
    
    return res.status(200).json(
        new ApiResponse(200, {
            subscribers,
            totalSubscribers,
            totalPages,
            page: pageNumber,
            limit: limitNumber
        }, "Channel subscribers fetched successfully")
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    if (!subscriberId) {
        throw new ApiError(400, "Subscriber ID is required");
    }
    
    if (!mongoose.Types.ObjectId.isValid(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }
    
    // Check if user exists
    const user = await User.findById(subscriberId);
    
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    
    const subscriptions = await Subscription.find({ subscriber: subscriberId })
        .populate("chanel", "username fullName avatar coverImage")
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);
    
    const channels = subscriptions.map(sub => sub.chanel);
    
    const totalSubscriptions = await Subscription.countDocuments({ subscriber: subscriberId });
    const totalPages = Math.ceil(totalSubscriptions / limitNumber);
    
    return res.status(200).json(
        new ApiResponse(200, {
            channels,
            totalSubscriptions,
            totalPages,
            page: pageNumber,
            limit: limitNumber
        }, "Subscribed channels fetched successfully")
    );
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}; 