import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    // Suhbat ishtirokchilari (2 kishi - private chat)
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    // Oxirgi xabar (preview uchun)
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DirectMessage",
      default: null,
    },

    // O'chirilganmi
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: "conversations",
    timestamps: true,
    versionKey: false,
  }
);

// Ikki foydalanuvchi o'rtasida faqat bitta suhbat bo'lishi uchun
ConversationSchema.index({ participants: 1 }, { unique: false });

export const Conversation = mongoose.model("Conversation", ConversationSchema);
