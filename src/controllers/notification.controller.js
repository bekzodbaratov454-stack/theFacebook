import { Notification } from "../models/notification.model.js";
import { NotFoundException } from "../exceptions/not-found.exception.js";
import { ForbiddenException } from "../exceptions/forbidden.exception.js";

class NotificationController {
  #_notificationModel;

  constructor() {
    this.#_notificationModel = Notification;
  }

  // O'z notificationlarini olish
  getAll = async (req, res, next) => {
    try {
      const userId = req.user.id;

      const notifications = await this.#_notificationModel
        .find({ recipient: userId })
        .populate("sender", "name username avatar_url")
        .sort({ createdAt: -1 })
        .limit(50);

      res.send({ success: true, data: notifications });
    } catch (error) {
      next(error);
    }
  };

  // O'qilmagan notificationlar sonini olish
  getUnreadCount = async (req, res, next) => {
    try {
      const userId = req.user.id;

      const count = await this.#_notificationModel.countDocuments({
        recipient: userId,
        isRead: false,
      });

      res.send({ success: true, data: { count } });
    } catch (error) {
      next(error);
    }
  };

  // Bitta notificationni o'qilgan deb belgilash
  markAsRead = async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const notification = await this.#_notificationModel.findById(id);

      if (!notification) throw new NotFoundException("Notification not found");

      if (notification.recipient.toString() !== userId) {
        throw new ForbiddenException("This notification is not yours");
      }

      notification.isRead = true;
      await notification.save();

      res.send({ success: true, message: "Marked as read" });
    } catch (error) {
      next(error);
    }
  };

  // Barcha notificationlarni o'qilgan deb belgilash
  markAllAsRead = async (req, res, next) => {
    try {
      const userId = req.user.id;

      await this.#_notificationModel.updateMany(
        { recipient: userId, isRead: false },
        { isRead: true }
      );

      res.send({ success: true, message: "All notifications marked as read" });
    } catch (error) {
      next(error);
    }
  };

  // Bitta notificationni o'chirish
  delete = async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const notification = await this.#_notificationModel.findById(id);

      if (!notification) throw new NotFoundException("Notification not found");

      if (notification.recipient.toString() !== userId) {
        throw new ForbiddenException("This notification is not yours");
      }

      await this.#_notificationModel.findByIdAndDelete(id);

      res.send({ success: true, message: "Notification deleted" });
    } catch (error) {
      next(error);
    }
  };

  // Barcha notificationlarni o'chirish
  deleteAll = async (req, res, next) => {
    try {
      const userId = req.user.id;

      await this.#_notificationModel.deleteMany({ recipient: userId });

      res.send({ success: true, message: "All notifications deleted" });
    } catch (error) {
      next(error);
    }
  };
}

export default new NotificationController();
