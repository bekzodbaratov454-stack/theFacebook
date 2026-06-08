// title    — String, required
// content  — String, required
// author   — ObjectId, ref: "User", required

import mongoose from "mongoose";


const PostSchema = new mongoose.Schema({
    title: {
        type : String,
        required : true,
        minlength : 3,
    },

    content: {
        type : String,
        minlength: 3,
        required : true,
    },

    author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
},

  image_url : {
    type : String,
    default : null,
  },

  video_url : {
    type : String,
    default : null,
  },

  created_by : {
    type : mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
    
},
  {
    collection: "posts",
    timestamps: true,
    versionKey: false,

  }
);

export const Post = mongoose.model("Post", PostSchema);