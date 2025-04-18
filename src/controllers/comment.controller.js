import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
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
    
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    
    const comments = await Comment.find({ video: videoId })
        .populate("owner", "username fullName avatar")
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);
    
    const totalComments = await Comment.countDocuments({ video: videoId });
    const totalPages = Math.ceil(totalComments / limitNumber);
    
    return res.status(200).json(
        new ApiResponse(200, {
            comments,
            totalComments,
            totalPages,
            page: pageNumber,
            limit: limitNumber
        }, "Comments fetched successfully")
    );
});

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;
    
    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }
    
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content is required");
    }
    
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    
    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    
    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    });
    
    const populatedComment = await Comment.findById(comment._id).populate("owner", "username fullName avatar");
    
    return res.status(201).json(
        new ApiResponse(201, populatedComment, "Comment added successfully")
    );
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    
    if (!commentId) {
        throw new ApiError(400, "Comment ID is required");
    }
    
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Updated comment content is required");
    }
    
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }
    
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }
    
    // Check if the user is the owner of the comment
    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this comment");
    }
    
    comment.content = content;
    await comment.save();
    
    return res.status(200).json(
        new ApiResponse(200, comment, "Comment updated successfully")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    
    if (!commentId) {
        throw new ApiError(400, "Comment ID is required");
    }
    
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }
    
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }
    
    // Check if the user is the owner of the comment
    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this comment");
    }
    
    await Comment.findByIdAndDelete(commentId);
    
    return res.status(200).json(
        new ApiResponse(200, {}, "Comment deleted successfully")
    );
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}; 