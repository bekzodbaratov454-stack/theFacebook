import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {

    name: {
      type: String,
      required: true,
      minlength: 3,
    },


    age: {
      type: Number,
      required: true,
      min: 16,
    },


    username: {
      type: String,
      required: true,
      minlength: 5,
      unique: true,
    },

  

      email: {
      type: String,
      required: true,
      unique: true,
    },



    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    avatar_url: {
      type: String,
      default: null,
    },

    role : {
      type : String,
      enum : ["USER" , "ADMIN"],
      default : "USER",
    },

  },
  
  {
    collection: "users",
    timestamps: true,
    versionKey: false,

  }
);

export const User = mongoose.model("User", UserSchema);