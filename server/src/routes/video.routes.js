import { Router } from "express";
import { uploadVideo } from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Apply verifyJWT middleware to all routes in this router if all video routes need authentication
router.use(verifyJWT);

router.route("/").post(
    upload.fields([
        { name: "videoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 },
    ]),
    uploadVideo
);

// Add other video-related routes here later (e.g., get video, update video, delete video)
// router.route("/:videoId").get(getVideoById);
// router.route("/:videoId").patch(updateVideoDetails);
// router.route("/:videoId").delete(deleteVideo);

export default router;
