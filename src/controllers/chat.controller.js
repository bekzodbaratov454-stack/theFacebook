import { Message } from "../models/message.model.js";

const ALLOWED_REACTIONS = ["❤️", "😂", "😮", "😢", "👍", "🔥"];

class ChatController {
  #_messageModel;

  constructor() {
    this.#_messageModel = Message;
  }

  // Global chatdagi oxirgi xabarlarni olish (pagination bilan)
  getMessages = async (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const before = req.query.before;

      const filter = { isDeleted: false };
      if (before) {
        filter._id = { $lt: before };
      }

      const messages = await this.#_messageModel
        .find(filter)
        .populate("sender", "name username avatar_url")
        .populate({
          path: "replyTo",
          select: "text sender isDeleted",
          populate: { path: "sender", select: "name username" },
        })
        .sort({ createdAt: -1 })
        .limit(limit);

      res.send({ success: true, data: messages.reverse() });
    } catch (error) {
      next(error);
    }
  };

  // Xabarni o'chirish (faqat o'z xabari yoki admin)
  deleteMessage = async (req, res, next) => {
    try {
      const { id } = req.params;

      const message = await this.#_messageModel.findById(id);
      if (!message) {
        return res.status(404).send({ success: false, message: "Message not found" });
      }

      const isOwner = message.sender.toString() === req.user.id;
      const isAdmin = req.user.role === "ADMIN";

      if (!isOwner && !isAdmin) {
        return res.status(403).send({ success: false, message: "You can only delete your own messages" });
      }

      message.isDeleted = true;
      await message.save();

      res.send({ success: true, message: "Message deleted" });
    } catch (error) {
      next(error);
    }
  };

  // Xabarga reaction qo'shish / olib tashlash (toggle)
  toggleReaction = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { emoji } = req.body;
      const userId = req.user.id;

      if (!ALLOWED_REACTIONS.includes(emoji)) {
        return res.status(400).send({ success: false, message: "Invalid reaction" });
      }

      const message = await this.#_messageModel.findById(id);
      if (!message || message.isDeleted) {
        return res.status(404).send({ success: false, message: "Message not found" });
      }

      const reactions = message.reactions || new Map();
      const users = reactions.get(emoji) || [];
      const idx = users.findIndex((u) => u.toString() === userId);

      if (idx === -1) {
        users.push(userId);
      } else {
        users.splice(idx, 1);
      }

      if (users.length === 0) {
        reactions.delete(emoji);
      } else {
        reactions.set(emoji, users);
      }

      message.reactions = reactions;
      message.markModified("reactions");
      await message.save();

      // Socket orqali real-time yangilash
      const io = req.app.get("io");
      const reactionsObj = {};
      message.reactions.forEach((v, k) => {
        reactionsObj[k] = v.map((u) => u.toString());
      });
      if (io) {
        io.to("global_chat").emit("chat:reaction", {
          messageId: id,
          reactions: reactionsObj,
        });
      }

      res.send({ success: true, data: reactionsObj });
    } catch (error) {
      next(error);
    }
  };
}

export default new ChatController();
