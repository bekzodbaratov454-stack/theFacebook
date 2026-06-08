import { Router } from "express";
import blogController from "../controllers/blog.controller.js";
import { ValidationMiddleware } from "../middlewares/validation.middleware.js";
import { LoginSchema } from "../schemas/auth/login.schema.js";      
import { RegisterSchema } from "../schemas/auth/register.schema.js";

import { User } from "../models/user.model.js";

const authRouter = Router();

authRouter
  .post("/signin", ValidationMiddleware(LoginSchema), blogController.login)
  .post("/signup", ValidationMiddleware(RegisterSchema), blogController.register)
  .post("/refresh" , blogController.refresh)
  .post("/forgot-password" , blogController.forgotPassword)
  .post("/reset-password" , blogController.resetPassword);

// Bir martalik setup — faqat hech qanday ADMIN bo'lmasa ishlaydi
authRouter.post("/setup-admin", async (req, res) => {
  try {
    const existing = await User.findOne({ role: "ADMIN" });
    if (existing) {
      return res.status(403).json({ success: false, message: "Admin already exists. This endpoint is disabled." });
    }
    const { username } = req.body;
    if (!username) return res.status(400).json({ success: false, message: "username required" });

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.role = "ADMIN";
    await user.save();
    res.json({ success: true, message: `✅ ${user.username} is now ADMIN` });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default authRouter;