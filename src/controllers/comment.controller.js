import mongoose, { Mongoose } from "mongoose";
import { Comment } from "../models/comments.model.js";
import { asyncHandler } from "../utils/asynccHandeler.js";
import { ApiError } from "../utils/apieror.js";
import { ApiResponse } from "../utils/apiResponse.js";
const addComment=asyncHandler(async(requestAnimationFrame,res)=>{
const {videoid}=req.params;
if(!videoid) throw new ApiError(400,"video not found");
const {_id}=req.user;
if(!_id) throw new ApiError(400,"user not found");
const {comment}=req.body;
if(!comment.trim()) throw new ApiError(400,"please provide a comment");
const newcomment=await Comment.create({
    content:comment.trim(),
    owner:_id,
    video:videoid
})
if(!newcomment) throw new ApiError(500,"eror in creating new comment");
return res.status(200).json(200,newcomment,"comment added sucessfully");
})
const updateComment=asyncHandler(async(req,res)=>{
const {videoid,commentid}=req.params;
if(!videoid||!commentid) throw new ApiError(400,"no comment or video found");

const{_id}=req.user;
if(!_id) throw new ApiError(400,"user is not found");
const{content}=req.body;
if(!content.trim())  throw new ApiError(400,"add new content");
const comment=await Comment.findById(commentid);
if(!comment)  throw new ApiError(400,"comment not found");
  if (comment.owner.toString() !== _id.toString() || comment.video.toString() !== videoid.toString()) {
    throw new ApiError(403, "Unauthorized to delete this comment");
  }
  comment.content=content.trim();
  await comment.save({validateBeforeSave: false})
  return res.status(200).json(200,comment,"comment updated succefully");

})
const deleteComment=asyncHandler(async(req,res)=>{
const {videoid,commentid}=req.params;
if(!videoid||!commentid) throw new ApiError(400,"no comment or video found");

const{_id}=req.user;
if(!_id) throw new ApiError(400,"user is not found");

 const comment=await Comment.findById(commentid);
  if(!comment) throw new ApiError(400,"comment not found");
  if (comment.owner.toString() !== _id.toString() || comment.video.toString() !== videoid.toString()) {
    throw new ApiError(403, "Unauthorized to delete this comment");
  }
 const result=await Comment.findByIdAndDelete(commentid);
 if(!result) throw new ApiError(500,"eror in deleting comment")
   return res.status(200).json(200,result,"comment deleted succefully");
})
const getallcomments=asyncHandler(async(req,res)=>{
    const {page=1,limit=20} =req.query;
const {videoid}=req.params;
if(!videoid) throw new ApiError(400,"video found");
const{_id}=req.user;
if(!_id) throw new ApiError(400,"please login");

const agregation=Comment.aggregate([
    {
        $match: {
               video: new mongoose.Types.ObjectId(videoid),
             },
    },
    {
       $sort: {
    "createdAt":-1
  },

    },
    {
        $lookup:{
            from:"users",
            localField:"owner",
            foreignField:"_id",
            as:"ownerinfo",
            pipeline:[
              {
        $project:{
            username:1,
            fullName:1,
            coverImage:1,
            avatar:1,
        }
    }
            ]
          
        }
    },
    {
        $addFields:{
            owner:{
                $first:"$ownerinfo",
        }
    }
    },
  
])
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
const result=await Comment.aggregatePaginate(agregation,options);
if(!result) return new ApiError(500,"eror in fetching comment");
return res.status(200).json(200,result,"commented fetched succefully");
})

export{addComment,getallcomments,deleteComment,updateComment};