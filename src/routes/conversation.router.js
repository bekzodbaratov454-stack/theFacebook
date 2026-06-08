import { Router } from "express";
import conversationController from "../controllers/conversation.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../configs/multer.config.js";

const conversationRouter = Router();

// Barcha suhbatlarni olish
conversationRouter.get(
  "/conversations",
  authMiddleware,
  conversationController.getConversations
);

// Biror foydalanuvchi bilan suhbat boshlash yoki mavjudini olish
conversationRouter.get(
  "/conversations/with/:targetUserId",
  authMiddleware,
  conversationController.getOrCreateConversation
);

// Suhbat xabarlarini olish
conversationRouter.get(
  "/conversations/:conversationId/messages",
  authMiddleware,
  conversationController.getMessages
);

// Matnli xabar yuborish
conversationRouter.post(
  "/conversations/:conversationId/messages",
  authMiddleware,
  conversationController.sendMessage
);

// Rasm yuborish
conversationRouter.post(
  "/conversations/:conversationId/messages/image",
  authMiddleware,
  upload.single("image"),
  conversationController.sendImage
);

// Xabar o'chirish
conversationRouter.delete(
  "/conversations/messages/:messageId",
  authMiddleware,
  conversationController.deleteMessage
);

export default conversationRouter;
