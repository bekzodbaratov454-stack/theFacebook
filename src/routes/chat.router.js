import { Router } from "express";
import chatController from "../controllers/chat.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const chatRouter = Router();

// Xabarlar tarixini olish (autentifikatsiya talab qilinadi)
chatRouter.get("/messages", authMiddleware, chatController.getMessages);

// Xabarni o'chirish
chatRouter.delete("/messages/:id", authMiddleware, chatController.deleteMessage);

// Reaction qo'shish / olib tashlash
chatRouter.post("/messages/:id/reaction", authMiddleware, chatController.toggleReaction);

export default chatRouter;
