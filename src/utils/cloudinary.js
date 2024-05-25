import { v2 as cloudinary } from "cloudinary";
import fs from "fs"
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary= async (filepath)=>{
try {
    console.log(filepath,"util clg")
    if(!filepath) return null;
    const response =await cloudinary.uploader.upload(filepath,{resource_type:'auto'})
    console.log("file has been uploaded",response.url);
    fs.unlinkSync(filepath);
    return response;
} catch (err) {
    fs.unlinkSync(filepath);
    return null;
}
}
export {uploadOnCloudinary}
