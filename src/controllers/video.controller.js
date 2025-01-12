import {Video} from "../models/video.model.js"
import { User } from "../models/user.model.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import mongoose from "mongoose"
import ApiResponse from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const uploadVideo=asyncHandler(async (req,res) => {
    const{title, description}=req.body
    //TODO
    
})

const getVideoById=asyncHandler(async (req,res) => {
    const{videoId}=req.params

    try {
        const video=await getVideoById(videoId);
    
        if(!video){
            throw new ApiError(400,"video not found")
        }
        return res.status(200)
        .json(new ApiResponse(200,video,"video fetched"))
    } catch (error) {
        throw new ApiError(400,"something went wrong while getting video id")
        
    }



})

const getAllVideos= asyncHandler(async (req,res) => {
    
    const {page=1, limit=10, query, sortBy='createdAt', sortType='desc', userId }=req.query

})
