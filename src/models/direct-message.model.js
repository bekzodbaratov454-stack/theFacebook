import mongoose from "mongoose";

const DirectMessageSchema = new mongoose.Schema(
  {
    // Qaysi suhbatga tegishli
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    // Xabar yozgan foydalanuvchi
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Xabar matni (matn yoki rasm bo'lishi mumkin)
    text: {
      type: String,
      default: null,
      maxlength: 2000,
    },

    // Rasm URL (yuklangan rasm)
    image_url: {
      type: String,
      default: null,
    },

    // O'chirilganmi (soft delete)
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: "direct_messages",
    timestamps: true,
    versionKey: false,
  }
);

export const DirectMessage = mongoose.model("DirectMessage", DirectMessageSchema);
