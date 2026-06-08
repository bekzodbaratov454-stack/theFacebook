import mongoose from "mongoose";

const FollowSchema = new mongoose.Schema(
  {


    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },


    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    
  },
  {
    collection: "follows",
    timestamps: true,
    versionKey: false,
  }
);

FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

export const Follow = mongoose.model("Follow", FollowSchema);