import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    // Kimga yuborildi
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Kim yubordi
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Notification turi: follow, like, comment, post, admin
    type: {
      type: String,
      enum: ["follow", "like", "comment", "post", "admin"],
      required: true,
    },

    // Qaysi post/comment bilan bog'liq (ixtiyoriy)
    reference: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    // Qo'shimcha matn
    message: {
      type: String,
      default: "",
    },

    // O'qilganmi
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

// Foydalanuvchi o'z notificationlarini tez olishi uchun index
NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", NotificationSchema);
