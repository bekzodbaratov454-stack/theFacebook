import { Router } from "express";
import notificationController from "../controllers/notification.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const notificationRouter = Router();

// Barcha routelar autentifikatsiya talab qiladi
notificationRouter.use(authMiddleware);

notificationRouter
  .get("/", notificationController.getAll)
  .get("/unread-count", notificationController.getUnreadCount)
  .patch("/:id/read", notificationController.markAsRead)
  .patch("/read-all", notificationController.markAllAsRead)
  .delete("/", notificationController.deleteAll)
  .delete("/:id", notificationController.delete);

export default notificationRouter;
