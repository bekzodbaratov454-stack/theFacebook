import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // "reply" type qo'shildi
    type: {
      type: String,
      enum: ["follow", "like", "comment", "reply", "post", "admin"],
      required: true,
    },

    reference: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    message: {
      type: String,
      default: "",
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: "notifications",
    timestamps: true,
    versionKey: false,
  }
);

NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", NotificationSchema);