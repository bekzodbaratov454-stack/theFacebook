import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 1000,
    },
    // Reply qilingan xabar
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    // Reactions: { "😂": ["userId1", "userId2"], "❤️": ["userId3"] }
    reactions: {
      type: Map,
      of: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: {},
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: "messages",
    timestamps: true,
    versionKey: false,
  }
);

export const Message = mongoose.model("Message", MessageSchema);
