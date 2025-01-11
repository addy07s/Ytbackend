import {Video} from "../models/video.model.js"
import { User } from "../models/user.model.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import mongoose from "mongoose"
import ApiResponse from "../utils/ApiResponse.js"

const uploadVideo=asyncHandler(async (req,res) => {
    const{videoFile}=req.body
    
})

const getVideoById=asyncHandler(async (req,res) => {
    
})
