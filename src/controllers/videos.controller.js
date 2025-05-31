import { asyncHandler } from "../utils/asynccHandeler.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/apieror.js";
import fs from "fs";
import { uploadonCloudinary,deleteFile} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";

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
   const userid = req.user?._id;
   if (!userid) {
   throw new ApiError(401, "user not found");
  }
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
     const userid = req.user?._id;
 
  if (!userid) {
    remove("",thumbnail.path);
    throw new ApiError(401, "user not found");
  }
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
  const userid = req.user?._id;
  if (!userid) {
   throw new ApiError(401, "user not found");
  }
   if(!id) throw(new ApiError(400,"video not found"));
  const video=await Video.findById(id);
  if(!video) throw(new ApiError(400,"video not found"));
  if(video.videoFile) await deleteFile(video.videoFile)
  if(video.thumbnail) await  deleteFile(video.thumbnail)
  const result=await Video.findByIdAndDelete(id)
  if(!result) throw(new ApiError(500,"eror in deleting video"));
  return res.status(200).json(new ApiResponse(200,result,"video deleted succefully"));


})
const changestatus=asyncHandler(async(req,res)=>{
 const{id}=req.params
   const userid = req.user?._id;
 if (!userid) {
   throw new ApiError(401, "user not found");
  }
    if(!id) throw(new ApiError(400,"video not found"));
  const video=await Video.findById(id);
  if(!video) throw(new ApiError(400,"video not found"));
  video.isPublic=(video.isPublic)?false:true;
 await video.save({validateBeforeSave: false})
 return res.status(200).json(new ApiResponse(200,video,"status changed succefully"));
})
const getallvideos=asyncHandler(async(req,res)=>{
 const userid = req.user?._id;
 if (!userid) {
 throw new ApiError(401, "user not found");
  }
  const{page=1,limit=10,query="",sortBy="createdAt",sortType=-1,mine=-1}=req.query
  ////sorttype=1 asscending order .sort type=-1 descending order
   console.log(page,limit,sortBy)
   console.log('hi');
  ////creating a filter for query
  const filter={};
  if(query){
    filter.tittle= { $regex: query, $options: 'i' }; ///i for insensitive serach
  }
const sortStage = {
  $sort: {
    [sortBy]: parseInt(sortType)
  },
};
const aggregation=Video.aggregate([
  {
    $match:(mine==1)?{
      owner:new mongoose.Types.ObjectId(req.user._id),
    }:{}
  },
    {
      $match:filter
      
    },
   sortStage,
    {
      $lookup:{
        from:"users",
        localField:"owner",
        foreignField:"_id",
        as:"ownerinfo",
        pipeline:[
        {
            $project: {
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
        }
        ]

      }
    },
    {
      $addFields:{
        ownerinfo:{
          $first:"$ownerinfo"
        }
      }
    },
   
  ])
  // console.log("dataa",aggregation)
const options={
   page:parseInt(page),
   limit:parseInt(limit),
   customLabels: {
  totalDocs: 'itemCount',
  docs: 'itemsList',
  limit: 'perPage',
  page: 'currentPage',
  nextPage: 'next',
  prevPage: 'prev',
  totalPages: 'pageCount',
  hasPrevPage: 'hasPrev',
  hasNextPage: 'hasNext',
  pagingCounter: 'pageCounter',
  meta: 'paginator'
}


}
  /*expamle simple version
const videos = await Video.find()
  .sort({ views: -1 }) // Sort by views in descending order
  .skip(((page-1)*limit) // Skip the appropriate number of videos
  .limit(limit); // Limit the number of videos returned:contentReference[oaicite:5]{index=5}
*/
// console.log(typeof(Video.aggregatePaginate))
const result=await Video.aggregatePaginate(aggregation,options);
   if(!result) throw(new ApiError(500,"eror in fetching videos"))
    return res.status(200).json(new ApiResponse(200,result,"videos fetched succefully"));
})




export { uploadvideo ,getvideobyid,updatevideo,deleteVideo,changestatus,getallvideos};
