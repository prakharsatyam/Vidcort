import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  const { username, email, fullname, password } = req.body;
  //validation not empty
  if (
    [username, email, fullname, password].some((elem) => elem.trim() === "")
  ) {
    throw new ApiError(400, "all fields are mandatory");
  }
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.match(regex)) {
    throw new ApiError(400, "enter a correct email address");
  }
  // check if the user already exists : email, username
    const existedUser= await User.findOne({
      $or: [{ email }, { username }]}) 
      if(existedUser){ throw new ApiError(409,"user already exists")}
  //check for images, check for avatar
  const avatarLocalPath=req.files?.avatar[0]?.path
  if (!avatarLocalPath) {
    throw new ApiError(400,"avatar file is required");
  }
  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0)
    {
      coverImageLocalPath=req.files.coverImage[0].path
    }
  // upload them on cloudinary
  const avatar =await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)
  if(!avatar)
    {
      throw new ApiError(400,"avatar file is required: cloudinary error");
    }
  // create user object - create entry in db
    const user =await User.create({
      fullname,
      avatar: avatar.url,
      coverImage:coverImage.url || "",
      email,
      password,
      username:username.toLowerCase()
    })
    console.log(user)
  // remove password and refresh token field from the response
     const createdUser = await User.findById(user._id).select("-password -refreshToken")

  // check for user creation
  if(!createdUser){
    throw new ApiError(500,"user not created try again")
  }
  // return res
  return res.status(201).json(new ApiResponse(200,createdUser,"user registered successfully"))
});

export { registerUser };
