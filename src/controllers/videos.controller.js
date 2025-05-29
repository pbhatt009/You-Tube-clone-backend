import { asyncHandler } from "../utils/asynccHandeler.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/apieror.js";
import fs from "fs";
import { uploadonCloudinary,deleteFile} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
function remove(videofilepath, thumbnailfilepath) {
  console.log("thumbanilpath",thumbnailfilepath)
  if (videofilepath) fs.unlinkSync(videofilepath);
  if (thumbnailfilepath) fs.unlinkSync(thumbnailfilepath);
}

const uploadvideo = asyncHandler(async (req, res) => {
  /////get the files from local path
  let localvideopath = null;
  if (
    req.files &&
    Array.isArray(req.files.videoFile) &&
    req.files.videoFile.length > 0
  ) {
    localvideopath = req.files.videoFile[0].path;
  }
  let localthumbnailpath = null;
  if (
    req.files &&
    Array.isArray(req.files.thumbnail) &&
    req.files.thumbnail.length > 0
  ) {
    localthumbnailpath = req.files.thumbnail[0].path;
  }
  if (!localvideopath) throw new ApiError(400, "no video is uploaded");
  /////thumbnail is not madatory

  ////////// check for  all imput data from body
  let { tittle, description, isPublic } = req.body;

  if ([tittle, description].some((field) => !field?.trim())) {
    remove(localvideopath, localthumbnailpath);
    throw new ApiError(400, "all fields are required");
  }
  ////check for user;
  console.log(req.user);
  const userid = req.user?._id;
  console.log(userid);
  if (!userid) {
    remove(localvideopath, localthumbnailpath);
    throw new ApiError(401, "user not found");
  }
  /////////upload to cloudinery:
  ////handeling ispubliuc ///ispublic can not be undefined or null from client side
  if (isPublic === "" || isPublic === "true") isPublic = true;
  else isPublic = false;
  const videoFile = await uploadonCloudinary(localvideopath);
  let thumbnail = null;
  if (localthumbnailpath)
    thumbnail = await uploadonCloudinary(localthumbnailpath);
  const videouploaded = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnail?.url || null,
    owner: userid,
    tittle,
    description,
    isPublic: Boolean(isPublic),
    duration: videoFile.duration,
    views: 0,
  });
  if (!videouploaded) {
    throw new ApiError(503, "eror in uploading video");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, videouploaded, "Video Uploaded successfully"));
});

const getvideobyid=asyncHandler(async(req,res)=>{
  const {id}=req.params
  if(!id) throw(new ApiError(400,"video not found"));
  const video=await Video.findById(id);
  if(!video) throw(new ApiError(400,"video not found"));
  return res.status(200).json(new ApiResponse(200,video,"video fetched succefully"));
})

const updatevideo=asyncHandler(async(req,res)=>{
  const{id}=req.params
   const{tittle,description}=req.body
   const thumbnail=req.file
   if(!tittle||!description){
     remove("",thumbnail.path);
    throw(new ApiError(400,"give all inputs"));
   }
    if(!id){
      remove("",thumbnail.path);
       throw(new ApiError(400,"video not found"));
    }
  const video=await Video.findById(id);
  if(!video) {
     remove("",thumbnail.path);
    throw(new ApiError(400,"video not found"));
  }
  const deletethumb=await deleteFile(video.thumbnail)
  // console.log("hiii",deletethumb)
    let newthumb=null
    if(thumbnail)  newthumb=await uploadonCloudinary(thumbnail.path);

  video.thumbnail=(newthumb)?newthumb.url:null
  video.tittle=tittle
  video.description=description
  await video.save({validateBeforeSave: false})
 return  res.status(200).json(new ApiResponse(200,video,"video updated succesfully"))
  

})

const deleteVideo=asyncHandler(async(req,res)=>{
  const {id}=req.params;
   if(!id) throw(new ApiError(400,"video not found"));
  const video=await Video.findById(id);
  if(!video) throw(new ApiError(400,"video not found"));
  if(video.videoFile) await deleteFile(video.videoFile)
  if(video.thumbnail) await  deleteFile(video.thumbnail)
  const result=await Video.findByIdAndDelete(id)
  if(!result) throw(new ApiError(500,"eror in deleting video"));
  return res.status(200).json(new ApiResponse(200,result,"video deleted succefully"));


})



export { uploadvideo ,getvideobyid,updatevideo,deleteVideo};
