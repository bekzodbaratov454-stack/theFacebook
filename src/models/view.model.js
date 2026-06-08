import mongoose from "mongoose";


const ViewSchema = new mongoose.Schema(
  {

    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    viewedAt: {
      type: Date,
      default: Date.now,
    },
    

    ip: {
      type: String,
      default: null,
    },
  },

  
  {
    collection: "views",
    timestamps: false,
    versionKey: false,
  }


);

ViewSchema.index({ post: 1, user: 1 }, { unique: true });

export const View = mongoose.model("View", ViewSchema);