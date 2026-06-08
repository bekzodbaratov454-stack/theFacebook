import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";
import { Post } from "../models/post.model.js";
import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";
import { Follow } from "../models/follow.model.js";
import { View } from "../models/view.model.js";
import { Message } from "../models/message.model.js";
import { Notification } from "../models/notification.model.js";
import { NotFoundException } from "../exceptions/not-found.exception.js";
import { ConflictException } from "../exceptions/conflict.exception.js";
import { BadRequestException } from "../exceptions/bad-request.exception.js";

class AdminController {
  // ─────────────────────────────────────────────
  // DASHBOARD — umumiy statistika
  // ─────────────────────────────────────────────
  getDashboard = async (req, res, next) => {
    try {
      const [
        totalUsers,
        totalPosts,
        totalComments,
        totalLikes,
        totalFollows,
        totalMessages,
        totalNotifications,
        activeUsers,
        adminUsers,
      ] = await Promise.all([
        User.countDocuments(),
        Post.countDocuments(),
        Comment.countDocuments(),
        Like.countDocuments(),
        Follow.countDocuments(),
        Message.countDocuments({ isDeleted: false }),
        Notification.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ role: "ADMIN" }),
      ]);

      // Oxirgi 7 kunda ro'yxatdan o'tganlar
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const newUsersThisWeek = await User.countDocuments({
        createdAt: { $gte: sevenDaysAgo },
      });

      // Oxirgi 7 kunda yaratilgan postlar
      const newPostsThisWeek = await Post.countDocuments({
        createdAt: { $gte: sevenDaysAgo },
      });

      res.send({
        success: true,
        data: {
          users: { total: totalUsers, active: activeUsers, admins: adminUsers, newThisWeek: newUsersThisWeek },
          posts: { total: totalPosts, newThisWeek: newPostsThisWeek },
          comments: { total: totalComments },
          likes: { total: totalLikes },
          follows: { total: totalFollows },
          messages: { total: totalMessages },
          notifications: { total: totalNotifications },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // ─────────────────────────────────────────────
  // USERS — boshqaruv
  // ─────────────────────────────────────────────

  // Barcha foydalanuvchilar (filter + pagination)
  getAllUsers = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const filter = {};
      if (req.query.role) filter.role = req.query.role;
      if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === "true";
      if (req.query.search) {
        const safe = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filter.$or = [
          { username: { $regex: safe, $options: "i" } },
          { name: { $regex: safe, $options: "i" } },
          { email: { $regex: safe, $options: "i" } },
        ];
      }

      const [users, total] = await Promise.all([
        User.find(filter)
          .select("-password")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        User.countDocuments(filter),
      ]);

      res.send({
        success: true,
        data: {
          users,
          pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // Bitta foydalanuvchi to'liq ma'lumoti
  getUser = async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException("Invalid user id");

      const [user, postsCount, followersCount, followingCount] = await Promise.all([
        User.findById(id).select("-password"),
        Post.countDocuments({ author: id }),
        Follow.countDocuments({ following: id }),
        Follow.countDocuments({ follower: id }),
      ]);

      if (!user) throw new NotFoundException("User not found");

      res.send({
        success: true,
        data: { ...user.toObject(), stats: { postsCount, followersCount, followingCount } },
      });
    } catch (error) {
      next(error);
    }
  };

  // Foydalanuvchini ADMIN qilish
  makeAdmin = async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException("Invalid user id");

      const user = await User.findByIdAndUpdate(id, { role: "ADMIN" }, { new: true }).select("-password");
      if (!user) throw new NotFoundException("User not found");

      res.send({ success: true, message: `${user.username} is now ADMIN`, data: user });
    } catch (error) {
      next(error);
    }
  };

  // Adminni USER ga qaytarish
  removeAdmin = async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException("Invalid user id");
      if (id === req.user.id) throw new BadRequestException("You cannot remove your own admin role");

      const user = await User.findByIdAndUpdate(id, { role: "USER" }, { new: true }).select("-password");
      if (!user) throw new NotFoundException("User not found");

      res.send({ success: true, message: `${user.username} is now USER`, data: user });
    } catch (error) {
      next(error);
    }
  };

  // Bloklash / aktivlashtirish
  toggleActive = async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException("Invalid user id");
      if (id === req.user.id) throw new BadRequestException("You cannot deactivate yourself");

      const user = await User.findById(id);
      if (!user) throw new NotFoundException("User not found");

      user.isActive = !user.isActive;
      await user.save();

      res.send({
        success: true,
        message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
        data: { id: user._id, username: user.username, isActive: user.isActive },
      });
    } catch (error) {
      next(error);
    }
  };

  // Foydalanuvchini o'chirish (unga tegishli barcha ma'lumotlar bilan)
  deleteUser = async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException("Invalid user id");
      if (id === req.user.id) throw new BadRequestException("You cannot delete yourself");

      const user = await User.findById(id);
      if (!user) throw new NotFoundException("User not found");

      // Foydalanuvchiga tegishli barcha ma'lumotlarni o'chirish
      await Promise.all([
        Post.deleteMany({ author: id }),
        Comment.deleteMany({ author: id }),
        Like.deleteMany({ user: id }),
        Follow.deleteMany({ $or: [{ follower: id }, { following: id }] }),
        Notification.deleteMany({ $or: [{ recipient: id }, { sender: id }] }),
        Message.deleteMany({ sender: id }),
        User.findByIdAndDelete(id),
      ]);

      res.send({ success: true, message: `User "${user.username}" and all related data deleted` });
    } catch (error) {
      next(error);
    }
  };

  // Yangi admin yaratish
  createAdmin = async (req, res, next) => {
    try {
      const { name, age, username, password, email } = req.body;

      if (!password || password.length < 6) throw new BadRequestException("Password must be at least 6 characters");

      const existing = await User.findOne({ $or: [{ username }, { email }] });
      if (existing) throw new ConflictException("Username or email already taken");

      const hashedPass = await bcrypt.hash(password, 10);
      const newAdmin = await User.create({ name, age, username, email, password: hashedPass, isActive: true, role: "ADMIN" });

      const adminObj = newAdmin.toObject();
      delete adminObj.password;

      res.status(201).send({ success: true, data: adminObj });
    } catch (error) {
      next(error);
    }
  };

  // ─────────────────────────────────────────────
  // POSTS — boshqaruv
  // ─────────────────────────────────────────────

  // Barcha postlar (filter + pagination)
  getAllPosts = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const filter = {};
      if (req.query.author) filter.author = req.query.author;
      if (req.query.search) {
        const safe = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filter.$or = [
          { title: { $regex: safe, $options: "i" } },
          { content: { $regex: safe, $options: "i" } },
        ];
      }

      const [posts, total] = await Promise.all([
        Post.find(filter)
          .populate("author", "name username avatar_url")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Post.countDocuments(filter),
      ]);

      res.send({
        success: true,
        data: { posts, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } },
      });
    } catch (error) {
      next(error);
    }
  };

  // Postni o'chirish
  deletePost = async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException("Invalid post id");

      const post = await Post.findById(id);
      if (!post) throw new NotFoundException("Post not found");

      await Promise.all([
        Post.findByIdAndDelete(id),
        Comment.deleteMany({ post: id }),
        Like.deleteMany({ post: id }),
        View.deleteMany({ post: id }),
      ]);

      res.send({ success: true, message: "Post and related data deleted" });
    } catch (error) {
      next(error);
    }
  };

  // ─────────────────────────────────────────────
  // COMMENTS — boshqaruv
  // ─────────────────────────────────────────────

  // Barcha commentlar
  getAllComments = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const filter = {};
      if (req.query.post) filter.post = req.query.post;
      if (req.query.author) filter.author = req.query.author;

      const [comments, total] = await Promise.all([
        Comment.find(filter)
          .populate("author", "name username avatar_url")
          .populate("post", "title")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Comment.countDocuments(filter),
      ]);

      res.send({
        success: true,
        data: { comments, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } },
      });
    } catch (error) {
      next(error);
    }
  };

  // Commentni o'chirish
  deleteComment = async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException("Invalid comment id");

      const comment = await Comment.findByIdAndDelete(id);
      if (!comment) throw new NotFoundException("Comment not found");

      res.send({ success: true, message: "Comment deleted" });
    } catch (error) {
      next(error);
    }
  };

  // ─────────────────────────────────────────────
  // MESSAGES — chat boshqaruv
  // ─────────────────────────────────────────────

  // Barcha chat xabarlari (o'chirilganlar ham)
  getAllMessages = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;

      const [messages, total] = await Promise.all([
        Message.find()
          .populate("sender", "name username avatar_url")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Message.countDocuments(),
      ]);

      res.send({
        success: true,
        data: { messages: messages.reverse(), pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } },
      });
    } catch (error) {
      next(error);
    }
  };

  // Xabarni butunlay o'chirish (hard delete)
  deleteMessage = async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException("Invalid message id");

      const message = await Message.findByIdAndDelete(id);
      if (!message) throw new NotFoundException("Message not found");

      // Socket orqali barcha foydalanuvchilarga xabar berish
      const io = req.app.get("io");
      if (io) io.to("global_chat").emit("chat:deleted", { messageId: id });

      res.send({ success: true, message: "Message permanently deleted" });
    } catch (error) {
      next(error);
    }
  };

  // ─────────────────────────────────────────────
  // NOTIFICATIONS — push yuborish
  // ─────────────────────────────────────────────

  // Bitta foydalanuvchiga notification yuborish
  pushNotificationToUser = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { message } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) throw new BadRequestException("Invalid user id");
      if (!message?.trim()) throw new BadRequestException("Message is required");

      const recipient = await User.findById(id);
      if (!recipient) throw new NotFoundException("User not found");

      const notification = await Notification.create({
        recipient: id,
        sender: req.user.id,
        type: "admin",
        message: message.trim(),
      });

      const populated = await notification.populate("sender", "name username avatar_url");

      // Real-time yuborish
      const io = req.app.get("io");
      if (io) io.to(`user:${id}`).emit("notification", populated);

      res.send({ success: true, message: "Notification sent", data: populated });
    } catch (error) {
      next(error);
    }
  };

  // Barcha foydalanuvchilarga (broadcast) notification yuborish
  pushNotificationToAll = async (req, res, next) => {
    try {
      const { message } = req.body;
      if (!message?.trim()) throw new BadRequestException("Message is required");

      const users = await User.find({ role: "USER", isActive: true }).select("_id");

      if (users.length === 0) {
        return res.send({ success: true, message: "No active users found", data: { sent: 0 } });
      }

      // Bulk insert
      const notifications = users.map((u) => ({
        recipient: u._id,
        sender: req.user.id,
        type: "admin",
        message: message.trim(),
        isRead: false,
      }));

      const created = await Notification.insertMany(notifications);

      // Real-time: har bir foydalanuvchiga yuborish
      const io = req.app.get("io");
      if (io) {
        const senderInfo = { _id: req.user.id, name: req.user.name, username: req.user.username };
        users.forEach((u) => {
          io.to(`user:${u._id}`).emit("notification", {
            type: "admin",
            message: message.trim(),
            sender: senderInfo,
            isRead: false,
            createdAt: new Date(),
          });
        });
      }

      res.send({
        success: true,
        message: `Notification sent to ${created.length} users`,
        data: { sent: created.length },
      });
    } catch (error) {
      next(error);
    }
  };

  // Rol bo'yicha notification yuborish (masalan, faqat USERlarga)
  pushNotificationByRole = async (req, res, next) => {
    try {
      const { role } = req.params;
      const { message } = req.body;

      if (!["USER", "ADMIN"].includes(role)) throw new BadRequestException("Role must be USER or ADMIN");
      if (!message?.trim()) throw new BadRequestException("Message is required");

      const users = await User.find({ role, isActive: true }).select("_id");

      if (users.length === 0) {
        return res.send({ success: true, message: `No active ${role} users found`, data: { sent: 0 } });
      }

      const notifications = users.map((u) => ({
        recipient: u._id,
        sender: req.user.id,
        type: "admin",
        message: message.trim(),
        isRead: false,
      }));

      const created = await Notification.insertMany(notifications);

      const io = req.app.get("io");
      if (io) {
        const senderInfo = { _id: req.user.id, name: req.user.name, username: req.user.username };
        users.forEach((u) => {
          io.to(`user:${u._id}`).emit("notification", {
            type: "admin",
            message: message.trim(),
            sender: senderInfo,
            isRead: false,
            createdAt: new Date(),
          });
        });
      }

      res.send({
        success: true,
        message: `Notification sent to ${created.length} ${role} users`,
        data: { sent: created.length },
      });
    } catch (error) {
      next(error);
    }
  };

  // Barcha notificationlarni ko'rish (admin panel uchun)
  getAllNotifications = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 30;
      const skip = (page - 1) * limit;

      const filter = {};
      if (req.query.type) filter.type = req.query.type;
      if (req.query.recipient) filter.recipient = req.query.recipient;

      const [notifications, total] = await Promise.all([
        Notification.find(filter)
          .populate("sender", "name username avatar_url")
          .populate("recipient", "name username")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Notification.countDocuments(filter),
      ]);

      res.send({
        success: true,
        data: { notifications, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } },
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new AdminController();
