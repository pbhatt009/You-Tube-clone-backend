import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
import { extractPublicId } from "cloudinary-build-url";
import { ApiError } from "./apieror.js";
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
  } catch (err) {
    console.log("error in uploading file", err);
    // if file is not uploaded then delete the file from local
    fs.unlinkSync(filePath);
  }
};

const deleteFile = async (filePath) => {
  console.log("filePath", filePath);
  try {
    const publicId = extractPublicId(filePath);
    console.log("publicId", publicId);
    if (!publicId) {
      throw new ApiError(400, "Invalid file path");
    }
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("result", result);
  } catch (err) {
    throw new ApiError(500, "error in deleting file", err);
  }
};
export { uploadonCloudinary, deleteFile };
