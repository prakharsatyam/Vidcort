import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import  jwt  from 'jsonwebtoken';
const generateAccessAndRefreshTokens=async(userId)=>{
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    user.refreshToken =refreshToken
    await user.save({validateBeforeSave: false})
    return {accessToken,refreshToken}
    
  } catch (error) {
    throw new ApiError(500,"couldn't generate access and refresh token")
  }
}
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
const loginUser = asyncHandler(async (req,res)=>{
  // get details from the body
  const {email,password,username}= req.body
  // username or email based
if(!username && !email) throw new ApiError(400,"username or email is required")
  // find user
const user = await User.findOne({
  $or:[{email},{username}]
})
if(!user) throw new ApiError(404,"user does not exist sign up first")
  // check password
  const isPasswordValid = await user.isPasswordCorrect(password)
  if(!isPasswordValid) throw new ApiError(401,"Invalid User credentials")
  // generate access and refresh token
const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)
  // send cookies
  const loggedinUser= await User.findById(user._id).select("-password -refreshToken")

  const options={ // this ensures that the cookies can only be edited at the server side
    httpOnly: true,
    secure: true
  }
  return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(
    new ApiResponse(
      200,{
        user: loggedinUser,accessToken,refreshToken
      },"user logged in successfully"
    )
  )
})

const logoutUser = asyncHandler(async (req,res)=>{
  // finding the user 
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      }},
      {
        new:true
      }
    
  )
  //  ensuring that the cookies can only be edited at the server side 
  const options={ 
    httpOnly: true,
    secure: true
  }
  //removing his cookies 
  return res
  .status(200)
  .clearCookie("refreshToken",options)
  .clearCookie("accessToken",options)
  .json(new ApiResponse(200,{},"User logged out successfully"))

})

const refreshAccessToken = asyncHandler(async (req,res)=>{
//get the refresh token from the user 
const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
if(!incomingRefreshToken) throw new ApiError(401,"unauthorized accessas no refresh token is present please login ")
// decode it and check wether there exists a token in the database 
const decodedRefreshToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
const user=await User.findById(decodedRefreshToken._id)
if(!user) throw new ApiError(401, "Invalid refresh token you might not have signed up or your token must have expired")
//check if the incoming refresh token and the token in databse are the same
if(!(incomingRefreshToken==user.refreshToken)) throw new ApiError(401,"Refresh tokens do not match refresh token has expired login to continue")
  //generate send these tokens and save the new refresh token in the databse 
const options={
  httpOnly:true,
  secure:true,
}
const {accessToken,newRefreshToken}= await generateAccessAndRefreshTokens(user._id)
res.status(200)
.cookie("accesstoken",accessToken,options)
.cookie("refreshToken",newRefreshToken,options)
.json(
  new ApiResponse(200,{accessToken,refreshToken:newRefreshToken},"Access and refresh token refreshed and the refresh token saved in db")
)
})

export { registerUser,loginUser,logoutUser,refreshAccessToken};
