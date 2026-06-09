import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
            minlength: 1,
        },

        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true,
        },

        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            default: null,
        },
    },
    {
        collection: "comments",
        timestamps: true,
        versionKey: false,
    }
);

export const Comment = mongoose.model("Comment", CommentSchema);