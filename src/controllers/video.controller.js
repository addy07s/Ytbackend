import {Video} from "../models/video.model.js"
import { User } from "../models/user.model.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import mongoose from "mongoose"
import ApiResponse from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const uploadVideo=asyncHandler(async (req,res) => {
    const{title, description}=req.body

    if(!req.file){
        throw new ApiError(400,"No video file uploaded")
    }

    if(!title || title.trim() === ""){
        throw new ApiError(400, "Title is required")
    }

    try {
        const videoLocalPath = req.file.path;
        const uploadResult = await uploadOnCloudinary(videoLocalPath);
        
        if(!uploadResult){
            throw new ApiError(500, "Error uploading video to Cloudinary")
        }
    
        const video = await Video.create({
            title,
            description: description || "",
            videoUrl: uploadResult.url,
            thumbnail: uploadResult.poster || "", // Use poster if cloudinary generates it
            duration: uploadResult.duration || 0,
            cloudinaryId: uploadResult.public_id,
            owner: req.user._id
        });
    
        return res.status(201).json(
            new ApiResponse(201, video, "Video published successfully")
        );
    } catch (error) { 
        throw new ApiError(500, error?.message || "Something went wrong while uploading video")
    }
})

const getVideoById=asyncHandler(async (req,res) => {
    const { videoId } = req.params;

    try {
        if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
            throw new ApiError(400, "Invalid video ID");
        }
        
        const video = await Video.findById(videoId)
            .populate("owner", "username fullName avatar");
    
        if(!video){
            throw new ApiError(404, "Video not found");
        }

        // Increment view count (can be more sophisticated in production)
        video.views = (video.views || 0) + 1;
        await video.save();
        
        return res.status(200)
        .json(new ApiResponse(200, video, "Video fetched successfully"));
    } catch (error) {
        throw new ApiError(
            error.statusCode || 500, 
            error.message || "Something went wrong while getting video"
        );
    }
})

const getAllVideos= asyncHandler(async (req,res) => {
    
    const {page=1, limit=10, query, sortBy='createdAt', sortType='desc', userId }=req.query
    const pageNum=parseInt(page)
    const limitNum=parseInt(limit)

    const filter = {
        ...(query && { title: { $regex: query, $options: 'i' } }), // Case-insensitive search on title
        ...(userId && { owner: userId }), // Filter by userId if provided
        isPublished: true // Only get published videos
    };
      
    const sort = { [sortBy]: sortType === 'desc' ? -1 : 1 };

    const videos = await Video.find(filter)
        .populate("owner", "username fullName avatar")
        .sort(sort)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

    const totalVideos = await Video.countDocuments(filter);
    const totalPages = Math.ceil(totalVideos / limitNum);

    return res.status(200).json(
        new ApiResponse(200, { 
            page: pageNum,
            limit: limitNum,
            totalPages, 
            videos, 
            totalVideos 
        }, 'Videos fetched successfully')
    );
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    
    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }
    
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    
    // Find the video
    const video = await Video.findById(videoId);
    
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    
    // Check if the user is the owner of the video
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }
    
    // Update thumbnail if provided
    let thumbnailUrl = video.thumbnail;
    if (req.file) {
        const thumbnailLocalPath = req.file.path;
        const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        
        if (uploadedThumbnail) {
            thumbnailUrl = uploadedThumbnail.url;
        }
    }
    
    // Update video fields
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title: title || video.title,
                description: description || video.description,
                thumbnail: thumbnailUrl
            }
        },
        { new: true }
    );
    
    return res.status(200).json(
        new ApiResponse(200, updatedVideo, "Video updated successfully")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    
    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }
    
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    
    // Find the video
    const video = await Video.findById(videoId);
    
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    
    // Check if the user is the owner of the video
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video");
    }
    
    // Delete the video
    await Video.findByIdAndDelete(videoId);
    
    // TODO: Delete video from cloudinary if cloudinaryId is available
    // if (video.cloudinaryId) {
    //     await cloudinary.uploader.destroy(video.cloudinaryId, { resource_type: 'video' });
    // }
    
    return res.status(200).json(
        new ApiResponse(200, {}, "Video deleted successfully")
    );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    
    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }
    
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    
    // Find the video
    const video = await Video.findById(videoId);
    
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    
    // Check if the user is the owner of the video
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }
    
    // Toggle the publish status
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !video.isPublished
            }
        },
        { new: true }
    );
    
    return res.status(200).json(
        new ApiResponse(
            200,
            { isPublished: updatedVideo.isPublished },
            `Video ${updatedVideo.isPublished ? "published" : "unpublished"} successfully`
        )
    );
});


export { uploadVideo, getVideoById, getAllVideos, updateVideo, deleteVideo, togglePublishStatus }
