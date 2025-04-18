import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes
import userRouter from "./src/routes/user.routes.js";
import videoRouter from "./src/routes/video.routes.js";
import commentRouter from "./src/routes/comment.routes.js";
import likeRouter from "./src/routes/like.routes.js";
import playlistRouter from "./src/routes/playlist.routes.js";
import tweetRouter from "./src/routes/tweet.routes.js";
import subscriptionRouter from "./src/routes/subscription.routes.js";
import dashboardRouter from "./src/routes/dashboard.routes.js";
import healthcheckRouter from "./src/routes/healthcheck.routes.js";

// Routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/healthcheck", healthcheckRouter);

// Default route
app.get("/", (req, res) => {
    res.send("YouTube Backend API is running!");
});

// Not found middleware
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        message: "Route not found" 
    });
});

export { app };