import { asyncHandler } from "../utils/asynccHandeler.js";
import { ApiError } from "../utils/apieror.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";

import fs from "fs";

import { uploadonCloudinary } from "../utils/cloudinary.js";

export const registerUser = asyncHandler(async (req, res) => {
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
    coverImagelocalpath = req.files.coverImage[0];
  }

  let avatarlocalpath = null;
  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    avatarlocalpath = req.files.avatar[0];
  } else {
    remove();
    throw new ApiError(400, "avatar is required");
  }

  function remove() {
    if (avatarlocalpath) fs.unlinkSync(avatarlocalpath.path);
    if (coverImagelocalpath) fs.unlinkSync(coverImagelocalpath.path);
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

  let avatar = await uploadonCloudinary(avatarlocalpath);
  let coverImage = await uploadonCloudinary(coverImagelocalpath);
  /////crreate user
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
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
