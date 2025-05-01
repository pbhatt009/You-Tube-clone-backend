import { asyncHandler } from "../utils/asynccHandeler.js";
import { ApiError } from "../utils/apieror.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import fs, { appendFile } from "fs";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

import { uploadonCloudinary, deleteFile } from "../utils/cloudinary.js";
function isValidEmail(email) {
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return emailRegex.test(email);
}
////function for generating tokens
const generatetokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};
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
    avatarlocalpath = await req.files.avatar[0].path;
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
    coverImage: coverImage ? coverImage.url : null,
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
  const { email, username, password } = req.body;
  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }
  let user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(401, "user not found");
  }
  ///check for password
  ///use user not User
  const ispasvalid = await user.ispasswordMatch(password);
  console.log("ispasvalid", ispasvalid);
  if (!ispasvalid) {
    throw new ApiError(401, "password is incorrect");
  }

  ///////create access token and refresh token
  const { accessToken, refreshToken } = await generatetokens(user._id);
  ///our user of this scope does not know about refreshToken

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  ///remove password and refresh token from user object
  user = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    ///makes cookie http only and secure can only be accessed snd modified by server
    ///http only means cookie is not accessible by javascript
    ///secure means cookie is only sent over https
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user, accessToken, refreshToken },
        "user logged in successfully"
      )
    );
});
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
  const user=await User.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: {
       refreshToken:0 ////completely remove the refrshtoken
      },
    },
    {
      new: true, //// if we  do not use this option it will return the old user object
    }
  );
  const options = {
    ///makes cookie http only and secure can only be accessed snd modified by server
    ///http only means cookie is not accessible by javascript
    ///secure means cookie is only sent over https
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200,{}, "user logged out successfully"));
});

const refreshTokenUpdate = asyncHandler(async (req, res, next) => {
  /////get the refresh token from cookies
  //////check if refresh token is present
  //////check if refresh token is valid and not expired
  //////check if user is present
  //generate new access token and refresh token
  //up[date the refresh token in db
  //////send the new access token and refresh token in cookies
  const IncomingrefreshToken =
    req.cookies?.refreshToken ||
    req.header("Authorization")?.replace("Bearer ", "") ||
    req.body?.refreshToken;
  if (!IncomingrefreshToken) {
    throw new ApiError(401, "unauthorized access");
  }
  /////if(token is not prsent or expired it will throw an error)
  try {
    const decodedToken = jwt.verify(
      IncomingrefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    if (!decodedToken) {
      throw new ApiError(401, "unauthorized access");
    }
    //  console.log("decodedToken", decodedToken);
    const user = await User.findById(decodedToken?._id).select("-password ");
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    // console.log("user", user);
    // console.log("IncomingrefreshToken", IncomingrefreshToken);
    if (user?.refreshToken !== IncomingrefreshToken) {
      throw new ApiError(401, "Refreh token is not valid");
    }
    ///generate new access token and refresh token
    const { accessToken, refreshToken } = await generatetokens(user._id);
    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });
    const options = {
      ///makes cookie http only and secure can only be accessed snd modified by server
      ///http only means cookie is not accessible by javascript
      ///secure means cookie is only sent over https
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { user, accessToken, refreshToken },
          "Access token and refresh token updated successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "unauthorized access");
  }
});
const changePassword = asyncHandler(async (req, res) => {
  /// get user from req.user
  ///get old password and new password from req.body
  ///check if old password is correct
  ///check if new password is same as old password
  ///update the password
  ///remove password and refresh token from user object
  ///return response
  console.log("req.body", req.body);
  console.log("req.user", req.user._id);

  const user = await User.findById(req.user._id); /////req.user will be available from auth middleware
  if (!user) {
    throw new ApiError(401, "user not found");
  }

  try {
    const { oldPassword, newPassword } = req.body;
    if (oldPassword === newPassword) {
      throw new ApiError(
        401,
        "new password should not be same as old password"
      );
    }
    if (!(await user.ispasswordMatch(oldPassword))) {
      throw new ApiError(401, "old password is incorrect");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    user.password = undefined;
    return res
      .status(200)
      .json(new ApiResponse(200, user, "password updated successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Something went wrong");
  }
});

const getcurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-password -refreshToken"
  );
  if (!user) {
    throw new ApiError(401, "user not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, user, "user fetched successfully"));
});
const updateUser = asyncHandler(async (req, res) => {
  const { username, fullName, email } = req.body;
  if (!fullName.trim() || !username.trim() || !email.trim()) {
    throw new ApiError(400, "all fields are required");
  }

  if (!isValidEmail(email)) {
    throw new ApiError(400, "email is not valid");
  }
  const user = await User.findById(req.user?._id).select(
    "-password -refreshToken"
  );
  if (!user) {
    throw new ApiError(401, "user not found");
  }
  if (user.username !== username) user.username = username;
  if (user.email !== email) user.email = email;
  if (user.fullName !== fullName) user.fullName = fullName;
  await user.save({ validateBeforeSave: false });
  res.status(200).json(new ApiResponse(200, user, "user updated successfully"));
});

const updateAvatar = asyncHandler(async (req, res) => {
  const avatar = req.file;
  if (!avatar) {
    throw new ApiError(400, "avatar is required");
  }
  const avatarlocalpath = avatar.path;

  const user = await User.findById(req.user?._id).select(
    "-password -refreshToken"
  );
  if (!user) {
    throw new ApiError(401, "user not found");
  }
  ////delete the old avatar from cloudinary
  if (user?.avatar) await deleteFile(user?.avatar);
  const newavatar = await uploadonCloudinary(avatarlocalpath);
  if (!newavatar) {
    throw new ApiError(500, "error in uploading avatar");
  }
  user.avatar = newavatar.url;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, user, "avatar updated successfully"));
});

const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImage = req.file;
  if (!coverImage) {
    throw new ApiError(400, "No cover image is chosen");
  }
  const coverImagelocalpath = coverImage.path;

  const user = await User.findById(req.user?._id).select(
    "-password -refreshToken"
  );
  if (!user) {
    throw new ApiError(401, "user not found");
  }
  ////delete the old cover image from cloudinary if it exists
  if (user?.coverImage) await deleteFile(user?.coverImage);
  ////upload the new cover image to cloudinary
  const newcoverImage = await uploadonCloudinary(coverImagelocalpath);
  if (!newcoverImage) {
    throw new ApiError(500, "error in uploading cover image");
  }
  ///update the cover image in user object
  user.coverImage = newcoverImage.url;

  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, user, "cover image updated suceesfully"));
});

const getuserchannel = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new ApiError(400, "username is required");
  }
  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "Channelvideos",
        pipeline: [
          {
            $project: {
              owner: 0,
            },
          },
        ],
      },
    },

    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        issubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        avatar: 1,
        coverImage: 1,
        subscriberCount: 1,
        channelsSubscribedToCount: 1,
        issubscribed: 1,
        Channelvideos: 1,
      },
    },
  ]);
  if (!channel?.length) {
    throw new ApiError(404, "channel not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "channel fetched successfully"));
});

const getwatchHistory = asyncHandler(async (req, res) => {
  const user = req.user;
  console.log(user?._id);
  if (!user) throw new ApiError(401, "user not found");
  const watchdetails = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistoryinfo",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "ownerinfo",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              ownerinfo: {
                $first: "$ownerinfo",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        watchdetails[0].watchHistoryinfo,
        "watch history fetched succesfully"
      )
    );
});

const updatewatchhistory = asyncHandler(async (req, res) => {
  const userid = req.user?._id;
  if (!userid) throw new ApiError(401, "user not found");
  const { videoid } = req.params;
  if (!videoid) throw new ApiError(401, "Video not found");
  const user = await User.findByIdAndUpdate(userid, {
    $push: {
      watchHistory: {
        $each: [videoid],
        $position: 0,
        $slice: 100, /////prev 100 video which have watched
      },
    },
  });
  if (!user) throw new ApiError(400, "eror in updating watch history");
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "watch history updated succefully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshTokenUpdate,
  changePassword,
  getcurrentUser,
  updateUser,
  updateAvatar,
  updateCoverImage,
  getuserchannel,
  getwatchHistory,
  updatewatchhistory,
};
