import { asyncHandler } from "../utils/asynccHandeler.js";
import { ApiError } from "../utils/apieror.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import multer from "multer";
import { uploadonCloudinary } from "../utils/cloudinary.js";
export const registerUser = asyncHandler(async (req, res) => {
  ///get user data from request body
  //validate data
  //check if user already exists:username or email
  //check for image,check for avatar
  //upload image to cloudinary
  //create user object - create user in db
  //remove password and refresh token from user object
  ///check for user creation
  ///return response
  const { fullName, email, username, password } = req.body;
  console.log("email", email);
  console.log("username", username);
  if (
    [fullName, email, username, password].some((field) => field.trim() === "")
  ) {
    ///if any field is empty
    throw new ApiError(400, "all fields are required");
  }
  ///check for email validation

  function isValidEmail(mail) {
    // Regular Expression (Regex) for basic email checking
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(mail.trim());
  }

  if (!isValidEmail(email)) {
    new ApiError(409, "email is not valid");
  }

  ///check weather user already exists

  if (await User.findOne(username)) {
    throw new ApiError(409, "Username already exists");
  }
  if (await User.findOne(email)) {
    throw new ApiError(409, "email already exists");
  }

  ///check for image,check for avatar
  console.log("req.files", req.files);
  const avatarlocalpath = req.files?.avatar[0]?.path;
  const coverImagelocalpath = req.files?.coverImage[0]?.path;
  if (!avatarlocalpath) {
    throw new ApiError(400, "avatar is required");
  }

  ///upload image to cloudinary
  const avatar = await uploadonCloudinary(avatarlocalpath);
  const coverImage = await uploadonCloudinary(coverImagelocalpath);
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }
  console.log(avatar);
  /////crreate user
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  console.log("user", user);
  /////remove the fields password and refresh token
  const CreatedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  console.log("CreatedUser", CreatedUser);
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
