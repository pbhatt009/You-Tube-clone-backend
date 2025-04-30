import { asyncHandler } from "../utils/asynccHandeler.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apieror.js";
import { ApiResponse } from "../utils/apiResponse.js";

const subscription = asyncHandler(async (req, res) => {
  const subscriber = req.user;
  // console.log(subscriber?._id)
  if (!subscriber) throw new ApiError(401, "username not found");
  const { channelname } = req.params;

  if (!channelname) throw new ApiError(401, "channelname not found");
  const user = await User.findOne({ username: channelname });
  const channelid = user?._id;
  //  console.log(channelid)
  if (!channelid) throw new ApiError(401, "channelid not found");

  const subscriberid = subscriber._id;

  await Subscription.create({
    channel: channelid,
    subscriber: subscriberid,
  });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { channelid, subscriberid },
        "Subscribed Successfully"
      )
    );
});
const unsubscription = asyncHandler(async (req, res) => {
  const subscriber = req.user;
  // console.log(subscriber?._id)
  if (!subscriber) throw new ApiError(401, "username not found");
  const { channelname } = req.params;
  // console.log(channelname )
  if (!channelname) throw new ApiError(401, "channelname not found");
  const user = await User.findOne({ username: channelname });
  const channelid = user?._id;
  //  console.log(channelid)
  if (!channelid) throw new ApiError(401, "channelid not found");

  const subscriberid = subscriber._id;
  console.log(subscriberid);
  console.log(channelid);
  await Subscription.deleteOne({
    subscriber: subscriberid,
    channel: channelid,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscriberid, channelid },
        "unsubscribed Successfully"
      )
    );
});

export { subscription, unsubscription };
