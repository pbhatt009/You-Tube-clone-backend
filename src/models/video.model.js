import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new Schema(
  {
    videoFile: {
      type: String, ///cloudernery url
      required: true,
    },
    thumbnail: {
      type: String, //cloudenery url
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tittle: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: Number,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublic: {
      type: Boolean,

      default: true,
    },
  },
  { timestamps: true }
);
videoSchema;
export const Video = mongoose.model("Video", videoSchema);
