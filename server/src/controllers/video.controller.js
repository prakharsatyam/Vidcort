import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const uploadVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    // Validate title and description
    if (!title || title.trim() === "" || !description || description.trim() === "") {
        throw new ApiError(400, "Title and description are required and cannot be empty.");
    }

    // Check for uploaded files
    const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoFileLocalPath) {
        throw new ApiError(400, "Video file is required.");
    }
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail file is required.");
    }

    let videoUploadResponse;
    let thumbnailUploadResponse;

    try {
        // Upload video to Cloudinary
        videoUploadResponse = await uploadOnCloudinary(videoFileLocalPath);
        if (!videoUploadResponse || !videoUploadResponse.url) {
            throw new ApiError(500, "Failed to upload video to Cloudinary. Please try again.");
        }

        // Upload thumbnail to Cloudinary
        try {
            thumbnailUploadResponse = await uploadOnCloudinary(thumbnailLocalPath);
            if (!thumbnailUploadResponse || !thumbnailUploadResponse.url) {
                // Thumbnail upload failed. Attempt to delete the successfully uploaded video file.
                if (videoUploadResponse.public_id) {
                    await deleteFromCloudinary(videoUploadResponse.public_id).catch(delError => {
                        console.error("Failed to cleanup video from Cloudinary after thumbnail upload error (inner):", delError);
                    });
                }
                throw new ApiError(500, "Failed to upload thumbnail to Cloudinary. Please try again.");
            }
        } catch (thumbError) {
            // This catch block handles errors specifically from the thumbnail upload process.
            if (videoUploadResponse && videoUploadResponse.public_id) {
                 await deleteFromCloudinary(videoUploadResponse.public_id).catch(delError => {
                    console.error("Failed to cleanup video from Cloudinary after thumbnail upload error (outer):", delError);
                });
            }
            if (!(thumbError instanceof ApiError)) {
                console.error("Unexpected error during thumbnail upload:", thumbError);
                throw new ApiError(500, "Unexpected error during thumbnail upload.");
            }
            throw thumbError;
        }

        // Both files uploaded successfully, now create video document in DB
        const video = await Video.create({
            title,
            description,
            videoFile: videoUploadResponse.url,
            thumbnail: thumbnailUploadResponse.url,
            duration: videoUploadResponse.duration || 0,
            owner: req.user?._id,
            isPublished: true,
        });

        if (!video) {
            // Video document creation failed in DB. Attempt to delete both uploaded files from Cloudinary.
            if (videoUploadResponse.public_id) {
                await deleteFromCloudinary(videoUploadResponse.public_id).catch(delError => console.error("DB Save: Cleanup video failed:", delError));
            }
            if (thumbnailUploadResponse.public_id) {
                await deleteFromCloudinary(thumbnailUploadResponse.public_id).catch(delError => console.error("DB Save: Cleanup thumbnail failed:", delError));
            }
            throw new ApiError(500, "Failed to save video details to the database. Please try again.");
        }

        return res.status(201).json(
            new ApiResponse(201, video, "Video uploaded successfully.")
        );

    } catch (error) {
        if (!(error instanceof ApiError)) {
            console.error("Unexpected error in uploadVideo (outer catch):", error);
            throw new ApiError(500, "An unexpected error occurred during video upload. Please try again later.");
        }
        throw error;
    }
});

// Add other controller functions here if any were previously defined.
// For now, we are only focusing on uploadVideo.
// Example:
// export const getVideoById = asyncHandler(async (req, res) => { /* ... */ });
