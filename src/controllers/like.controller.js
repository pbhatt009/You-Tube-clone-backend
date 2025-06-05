import mongoose, { Mongoose } from "mongoose";
import {Like} from "../models/like.model.schema.js"
import {Video} from "../models/video.model.js"
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asynccHandeler.js";
import { ApiError } from "../utils/apieror.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Comment } from "../models/comments.model.js";
const like=asyncHandler(async(req,res)=>{
 const {_id}=req.user;
 const{commentid="",videoid=""}=req.query;
 let result={};
 if(videoid.trim()){
     const video=await Video.findById(videoid);
     if(!video) throw new ApiError(400,"no video available");
       result=await  Like.create({
        video:videoid,
        comment:null,
        likedby:_id
}) }
else if(commentid.trim()){
     const comment=await Comment.findById(commentid);
     if(!comment) throw new ApiError(400,"no comment available");
       result=await  Like.create({
        video:null,
        comment:commentid,
        likedby:_id
})
}
if(!result) throw new ApiError(400,"bad request");

return res.status(200).json(new ApiResponse(200,result,"liked succefully"));


})
const unlike=asyncHandler(async(req,res)=>{
 const {_id}=req.user;
 const{likeid}=req.params;
 const like=await Like.findById(likeid);
 if(!like) throw new ApiError(400,"no like found");
 if(like.likedby.toString()!==_id.toString()) throw new ApiError(400,"unauthorized to dislike");
 await Like.findByIdAndDelete(likeid);
 return res.status(200).json(new ApiResponse(200,{},"unliked succefully"))

})
export {like,unlike}