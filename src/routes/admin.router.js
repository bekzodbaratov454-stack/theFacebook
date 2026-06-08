import { Router } from "express";
import adminController from "../controllers/admin.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { Roles } from "../middlewares/roles.middleware.js";
import { ValidationMiddleware } from "../middlewares/validation.middleware.js";
import { RegisterSchema } from "../schemas/auth/register.schema.js";

const adminRouter = Router();

// Barcha admin routelari: login bo'lgan + ADMIN role talab qiladi
adminRouter.use(authMiddleware, Roles("ADMIN"));

// ── DASHBOARD ──────────────────────────────────────────
adminRouter.get("/dashboard", adminController.getDashboard);

// ── USERS ──────────────────────────────────────────────
adminRouter
  .get("/users", adminController.getAllUsers)
  .get("/users/:id", adminController.getUser)
  .post("/users", ValidationMiddleware(RegisterSchema), adminController.createAdmin)
  .patch("/users/:id/make-admin", adminController.makeAdmin)
  .patch("/users/:id/remove-admin", adminController.removeAdmin)
  .patch("/users/:id/toggle-active", adminController.toggleActive)
  .delete("/users/:id", adminController.deleteUser);

// ── POSTS ──────────────────────────────────────────────
adminRouter
  .get("/posts", adminController.getAllPosts)
  .delete("/posts/:id", adminController.deletePost);

// ── COMMENTS ───────────────────────────────────────────
adminRouter
  .get("/comments", adminController.getAllComments)
  .delete("/comments/:id", adminController.deleteComment);

// ── CHAT MESSAGES ──────────────────────────────────────
adminRouter
  .get("/messages", adminController.getAllMessages)
  .delete("/messages/:id", adminController.deleteMessage);

// ── NOTIFICATIONS ──────────────────────────────────────
adminRouter
  // Barcha notificationlarni ko'rish
  .get("/notifications", adminController.getAllNotifications)

  // Bitta foydalanuvchiga push
  .post("/notifications/user/:id", adminController.pushNotificationToUser)

  // Barcha foydalanuvchilarga broadcast
  .post("/notifications/broadcast", adminController.pushNotificationToAll)

  // Rol bo'yicha push (USER yoki ADMIN)
  .post("/notifications/role/:role", adminController.pushNotificationByRole);

export default adminRouter;
