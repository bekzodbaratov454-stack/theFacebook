import { Notification } from "../models/notification.model.js";

/**
 * Notification yaratib, socket orqali real-time yuboradi
 * @param {object} io - Socket.io instance
 * @param {object} data - { recipient, sender, type, reference, message }
 */
export const createNotification = async (io, { recipient, sender, type, reference = null, message = "" }) => {
  try {
    // O'ziga notification yubormaslik
    if (recipient.toString() === sender.toString()) return;

    const notification = await Notification.create({
      recipient,
      sender,
      type,
      reference,
      message,
    });

    // Populate qilib real-time yuborish
    const populated = await notification.populate("sender", "name username avatar_url");

    // Socket orqali faqat shu foydalanuvchiga yuborish
    io.to(`user:${recipient}`).emit("notification", populated);

    return populated;
  } catch (error) {
    console.error("Notification create error:", error.message);
  }
};
