import { asyncHandler } from "../utils/asynccHandeler.js";
import { ApiError } from "../utils/apieror.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import fs from "fs";

import { uploadonCloudinary } from  "../utils/cloudinary.js"
////function for generating tokens
const generatetokens= async(userId)=>{
  try {
    const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()
     const refreshToken = user.generateRefreshToken()
   
    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return {accessToken, refreshToken}


} catch (error) {
    throw new ApiError(500, "Something went wrong while generating referesh and access token")
}
}



 const registerUser = asyncHandler(async (req, res) => {
  /////check the files are uploaded in local temp folder
  ///get user data from request body
  //validate data
  //check if user already exists:username or email

  //upload image to cloudinary
  //create user object - create user in db
  //remove password and refresh token from user object
  ///check for user creation
  ///return response
  let coverImagelocalpath = null;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImagelocalpath = await req.files.coverImage[0].path;
  }

  let avatarlocalpath = null;
  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    avatarlocalpath =await  req.files.avatar[0].path;
  } else {
    remove();
    throw new ApiError(400, "avatar is required");
  }

  function remove() {
    if (avatarlocalpath) fs.unlinkSync(avatarlocalpath);
    if (coverImagelocalpath) fs.unlinkSync(coverImagelocalpath);
  }
  //   console.log("req.body", req.body);
  const { fullName, email, username, password } = req.body;
  //   console.log("email", email);
  //   console.log("username", username);
  if (
    [fullName, email, username, password].some((field) => field.trim() === "")
  ) {
    ///if any field is empty
    remove();
    throw new ApiError(400, "all fields are required");
  }
  ///check for email validation

  function isValidEmail(mail) {
    // Regular Expression (Regex) for basic email checking
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(mail.trim());
  }

  if (!isValidEmail(email)) {
    remove();
    new ApiError(409, "email is not valid");
  }

  ///check weather user already exists

  if (await User.findOne({ username })) {
    remove();
    throw new ApiError(409, "Username already exists");
  }
  if (await User.findOne({ email })) {
    remove();
    throw new ApiError(409, "email already exists");
  }

  ///check for image,check for avatar and upload image to cloudinary
  /////avatra is required to upload
  //   console.log("req.files", req.files);
  console.log("avatarlocalpath", avatarlocalpath);
  console.log("coverImagelocalpath", coverImagelocalpath);

  let avatar = await uploadonCloudinary(avatarlocalpath);
  let coverImage = await uploadonCloudinary(coverImagelocalpath);
  /////crreate user
  console.log("avatar", avatar);
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: (coverImage)? coverImage.url : null,
    email,
    password,
    username: username.toLowerCase(),
  });
  //   console.log("user", user);
  /////remove the fields password and refresh token
  const CreatedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  //   console.log("CreatedUser", CreatedUser);
  ///another method to remove password and refresh token
  /*  const CreatedUser=await  User.findById(user._id)
  CreatedUser.password=undefined;
    CreatedUser.refreshToken=undefined;
    */
  if (!CreatedUser) {
    throw new ApiError(500, "Something went wrong while creating user");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, CreatedUser, "User created successfully"));
});

 const loginUser = asyncHandler(async (req, res) => {
/////login user
////check for email/usrname  and password format 
////match the  email and password with db
//if user is not found
//if password is not matched
///create access token and refresh token
 console.log("req.body", req.body);
const {email,username,password}=req.body;
if(!username &&!email){
  throw new ApiError(400,"username or email is required")

}
let user=await User.findOne({
    $or:[{username},{email}]

})
if(!user){
  throw new ApiError(401,"user not found")
}
///check for password
///use user not User
const ispasvalid=await user.ispasswordMatch(password)
console.log("ispasvalid",ispasvalid);
if(!ispasvalid){
  throw new ApiError(401,"password is incorrect")
}

///////create access token and refresh token
const {accessToken,refreshToken}=await generatetokens(user._id)
///our user of this scope does not know about refreshToken

user.refreshToken=refreshToken;
await user.save({validateBeforeSave:false})
///remove password and refresh token from user object
user=await User.findById(user._id).select("-password -refreshToken")

const options={
    ///makes cookie http only and secure can only be accessed snd modified by server
    ///http only means cookie is not accessible by javascript
    ///secure means cookie is only sent over https
    httpOnly:true,
     secure:true,
}

return res
.status(200)
.cookie("accessToken",accessToken,options)
.cookie("refreshToken",refreshToken,options)
.json(new ApiResponse(200,{user,accessToken,refreshToken},"user logged in successfully"))

})
 const logoutUser = asyncHandler(async (req, res) => {
///clear the cookies
///remove refresh token from db
//======================
////first method
// const user=await User.findById(req.user._id)
// if(!user){
//   throw new ApiError(401,"user not found")}
//   user.refreshToken=undefined;
//   user.save({validateBeforeSave:false})
  //=============================
  User.findByIdAndUpdate(req.user._id,
    {
    $set:{
refreshToken:undefined
    }
  },{
  new:true,//// if we  do not use this option it will return the old user object
  }
)
const options={
    ///makes cookie http only and secure can only be accessed snd modified by server
    ///http only means cookie is not accessible by javascript
    ///secure means cookie is only sent over https
    httpOnly:true,
    secure:true,
}
return res.status(200)
.clearCookie("accessToken",options)
.clearCookie("refreshToken",options)
.json(new ApiResponse(200,{},"user logged out successfully"))
})

const refreshTokenUpdate=asyncHandler(async(req,res,next)=>{
/////get the refresh token from cookies
//////check if refresh token is present
//////check if refresh token is valid and not expired
//////check if user is present
//generate new access token and refresh token
//up[date the refresh token in db
//////send the new access token and refresh token in cookies
      const IncomingrefreshToken=req.cookies?.refreshToken||req.header("Authorization")?.replace("Bearer ","")||req.body?.refreshToken;
      if(!IncomingrefreshToken){
        throw new ApiError(401,"unauthorized access")
      }
      /////if(token is not prsent or expired it will throw an error)
      try {
        const decodedToken=jwt.verify(IncomingrefreshToken,process.env.REFRESH_TOKEN_SECRET);
        if(!decodedToken){
          throw new ApiError(401,"unauthorized access")
        }
    
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken");
        if(!user){
          throw new ApiError(401,"Invalid refresh token")
        }
        if(user?.refreshToken!==IncomingrefreshToken){
          throw new ApiError(401,"Refreh token is not valid")
        }
        ///generate new access token and refresh token
        const {newAccessToken,newRefreshToken}=await generatetokens(user._id)
        user.refreshToken=newRefreshToken;
        await user.save({validateBeforeSave:false})
        const options={
          ///makes cookie http only and secure can only be accessed snd modified by server
          ///http only means cookie is not accessible by javascript
          ///secure means cookie is only sent over https
          httpOnly:true,
          secure:true,
      }
        res.status(200)
        .cookie("accessToken",newAccessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(new ApiResponse(200,{user,accessToken:newAccessToken,refreshToken:newRefreshToken},"Access token and refresh token updated successfully"))
        
      } catch (error) {
        throw new ApiError(401,error?.message||"unauthorized access")
        
      }

})
export {
  registerUser,
  loginUser,
  logoutUser,
  refreshTokenUpdate
} 