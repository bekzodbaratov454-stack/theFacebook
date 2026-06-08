import { Conversation } from "../models/conversation.model.js";
import { DirectMessage } from "../models/direct-message.model.js";
import { uploadToCloudinary } from "../configs/cloudinary.config.js";

class ConversationController {

  getConversations = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const conversations = await Conversation.find({
        participants: userId,
        isDeleted: false,
      })
        .populate("participants", "name username avatar_url")
        .populate({ path: "lastMessage", populate: { path: "sender", select: "name username avatar_url" } })
        .sort({ updatedAt: -1 });

      res.send({ success: true, data: conversations });
    } catch (error) {
      next(error);
    }
  };

  getOrCreateConversation = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { targetUserId } = req.params;

      if (userId === targetUserId)
        return res.status(400).send({ success: false, message: "O'zingiz bilan suhbat boshlab bo'lmaydi" });

      let conversation = await Conversation.findOne({
        participants: { $all: [userId, targetUserId] },
        isDeleted: false,
      }).populate("participants", "name username avatar_url");

      if (!conversation) {
        conversation = await Conversation.create({ participants: [userId, targetUserId] });
        conversation = await conversation.populate("participants", "name username avatar_url");
      }

      res.send({ success: true, data: conversation });
    } catch (error) {
      next(error);
    }
  };

  getMessages = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { conversationId } = req.params;
      const limit = parseInt(req.query.limit) || 30;
      const before = req.query.before;

      const conversation = await Conversation.findOne({
        _id: conversationId, participants: userId, isDeleted: false,
      });
      if (!conversation)
        return res.status(404).send({ success: false, message: "Suhbat topilmadi" });

      const filter = { conversation: conversationId, isDeleted: false };
      if (before) filter._id = { $lt: before };

      const messages = await DirectMessage.find(filter)
        .populate("sender", "name username avatar_url")
        .sort({ createdAt: -1 })
        .limit(limit);

      res.send({ success: true, data: messages.reverse() });
    } catch (error) {
      next(error);
    }
  };

  sendMessage = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { conversationId } = req.params;
      const { text } = req.body;

      if (!text?.trim())
        return res.status(400).send({ success: false, message: "Xabar matni bo'sh bo'lmasin" });

      const conversation = await Conversation.findOne({
        _id: conversationId, participants: userId, isDeleted: false,
      });
      if (!conversation)
        return res.status(404).send({ success: false, message: "Suhbat topilmadi" });

      const message = await DirectMessage.create({ conversation: conversationId, sender: userId, text: text.trim() });
      const populated = await message.populate("sender", "name username avatar_url");

      conversation.lastMessage = message._id;
      await conversation.save();

      const io = req.app.get("io");
      if (io) io.to(`conversation:${conversationId}`).emit("dm:message", populated);

      res.status(201).send({ success: true, data: populated });
    } catch (error) {
      next(error);
    }
  };

  // Rasm yuborish — Cloudinary ga yuklash
  sendImage = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { conversationId } = req.params;

      if (!req.file)
        return res.status(400).send({ success: false, message: "Rasm yuklanmadi" });

      const conversation = await Conversation.findOne({
        _id: conversationId, participants: userId, isDeleted: false,
      });
      if (!conversation)
        return res.status(404).send({ success: false, message: "Suhbat topilmadi" });

      // Cloudinary ga yuklash
      const b64 = req.file.buffer.toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      const imageUrl = await uploadToCloudinary(dataURI, "blog/dm-images");

      const message = await DirectMessage.create({
        conversation: conversationId,
        sender: userId,
        image_url: imageUrl,
      });
      const populated = await message.populate("sender", "name username avatar_url");

      conversation.lastMessage = message._id;
      await conversation.save();

      const io = req.app.get("io");
      if (io) io.to(`conversation:${conversationId}`).emit("dm:message", populated);

      res.status(201).send({ success: true, data: populated });
    } catch (error) {
      next(error);
    }
  };

  deleteMessage = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { messageId } = req.params;

      const message = await DirectMessage.findById(messageId);
      if (!message)
        return res.status(404).send({ success: false, message: "Xabar topilmadi" });

      if (message.sender.toString() !== userId && req.user.role !== "ADMIN")
        return res.status(403).send({ success: false, message: "Faqat o'z xabaringizni o'chira olasiz" });

      message.isDeleted = true;
      await message.save();

      const io = req.app.get("io");
      if (io) io.to(`conversation:${message.conversation}`).emit("dm:deleted", { messageId });

      res.send({ success: true, message: "Xabar o'chirildi" });
    } catch (error) {
      next(error);
    }
  };
}

export default new ConversationController();
