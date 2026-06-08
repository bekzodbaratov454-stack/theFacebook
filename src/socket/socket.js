import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { Message } from "../models/message.model.js";
import { Conversation } from "../models/conversation.model.js";

const ALLOWED_REACTIONS = ["❤️", "😂", "😮", "😢", "👍", "🔥"];

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];
      if (!token) return next(new Error("Token not provided"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error("Token is invalid"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;
    socket.join(`user:${userId}`);
    socket.join("global_chat");
    console.log(`🟢 User connected: ${userId} | socket: ${socket.id}`);

    // ─── GLOBAL CHAT ───────────────────────────────────────────────

    // Yangi xabar (reply qo'llab-quvvatlanadi)
    socket.on("chat:send", async (data) => {
      try {
        const text = data?.text?.trim();
        if (!text || text.length > 1000)
          return socket.emit("error", { message: "Invalid message" });

        const msgData = { sender: userId, text };
        if (data?.replyTo) msgData.replyTo = data.replyTo;

        const message = await Message.create(msgData);
        const populated = await Message.findById(message._id)
          .populate("sender", "name username avatar_url")
          .populate({
            path: "replyTo",
            select: "text sender isDeleted",
            populate: { path: "sender", select: "name username" },
          });

        io.to("global_chat").emit("chat:message", populated);
      } catch (err) {
        console.error("chat:send error:", err.message);
        socket.emit("error", { message: "Message could not be sent" });
      }
    });

    // Xabar o'chirish
    socket.on("chat:delete", async (data) => {
      try {
        const { messageId } = data;
        const message = await Message.findById(messageId);
        if (!message) return socket.emit("error", { message: "Message not found" });

        const isOwner = message.sender.toString() === userId;
        const isAdmin = socket.user.role === "ADMIN";
        if (!isOwner && !isAdmin)
          return socket.emit("error", { message: "You can only delete your own messages" });

        message.isDeleted = true;
        await message.save();
        io.to("global_chat").emit("chat:deleted", { messageId });
      } catch (err) {
        socket.emit("error", { message: "Could not delete message" });
      }
    });

    // Reaction toggle (socket orqali)
    socket.on("chat:react", async (data) => {
      try {
        const { messageId, emoji } = data;
        if (!ALLOWED_REACTIONS.includes(emoji)) return;

        const message = await Message.findById(messageId);
        if (!message || message.isDeleted) return;

        const reactions = message.reactions || new Map();
        const users = reactions.get(emoji) || [];
        const idx = users.findIndex((u) => u.toString() === userId);

        if (idx === -1) users.push(userId);
        else users.splice(idx, 1);

        if (users.length === 0) reactions.delete(emoji);
        else reactions.set(emoji, users);

        message.reactions = reactions;
        message.markModified("reactions");
        await message.save();

        const reactionsObj = {};
        message.reactions.forEach((v, k) => {
          reactionsObj[k] = v.map((u) => u.toString());
        });

        io.to("global_chat").emit("chat:reaction", {
          messageId,
          reactions: reactionsObj,
        });
      } catch (err) {
        console.error("chat:react error:", err.message);
      }
    });

    // ─── DIRECT MESSAGE ────────────────────────────────────────────

    socket.on("dm:join", async (data) => {
      try {
        const { conversationId } = data;
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: userId,
          isDeleted: false,
        });
        if (!conversation)
          return socket.emit("error", { message: "Suhbat topilmadi yoki ruxsat yo'q" });
        socket.join(`conversation:${conversationId}`);
        socket.emit("dm:joined", { conversationId });
      } catch (err) {
        socket.emit("error", { message: "Suhbatga qo'shilishda xatolik" });
      }
    });

    socket.on("dm:leave", (data) => {
      socket.leave(`conversation:${data.conversationId}`);
    });

    // ─── DISCONNECT ────────────────────────────────────────────────
    socket.on("disconnect", () => {
      console.log(`🔴 User disconnected: ${userId}`);
    });
  });

  return io;
};
