import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
    // Return a simple health check response
    return res.status(200).json(
        new ApiResponse(200, {
            status: "ok",
            message: "Server is running",
            uptime: process.uptime(),
            timestamp: new Date()
        }, "Health check successful")
    );
});

export { healthcheck }; 