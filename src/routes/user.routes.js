import Router from "express";
import { loginUser, logoutUser, registerUser,refreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Define a POST route for user registration
router.post("/register",
    // Use multer middleware to handle file uploads
    upload.fields([
        { name: "avatar", maxCount: 1 }, // Accept a single file with the field name "avatar"
        { name: "coverImage", maxCount: 1 } // Accept a single file with the field name "coverImage"
    ]),
    registerUser // Controller function to handle the registration logic
);

router.post("/login",loginUser)
//secured routes
router.post("/logout",verifyJWT,logoutUser)

router.post("/refresh-token",refreshAccessToken)

export default router;