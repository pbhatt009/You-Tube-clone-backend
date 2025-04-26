import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadonCloudinary = async (filePath) => {
  ///file  path is local path of file which is to be uploaded
  try {
    console.log("filePath", filePath);
    if (!filePath) return null;
    const res = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    //file is uploaded succesfully
    console.log("res", res);
    console.log("file is uploaded successfully", res);
    fs.unlinkSync(filePath);
    return res;
  } catch (err)  {
      console.log("error in uploading file", err);
      // if file is not uploaded then delete the file from local
      fs.unlinkSync(filePath);
    };
  
};
export { uploadonCloudinary };
