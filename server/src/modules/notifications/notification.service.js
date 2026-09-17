import Notification from './notification.model.js';
import { ApiError } from '../../utils/ApiError.js';

/**
 * Creates an in-app notification for a user.
 */
export async function createNotification({ userId, type, title, message, link = null }) {
  return Notification.create({
    userId,
    type,
    title,
    message,
    link,
  });
}

/**
 * Lists the most recent notifications for a user, along with total unread count.
 */
export async function listNotifications(userId, limit = 20) {
  const [items, unreadCount] = await Promise.all([
    Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),
    Notification.countDocuments({ userId, isRead: false }),
  ]);

  return {
    items: items.map((n) => ({
      id: n._id.toString(),
      type: n.type,
      title: n.title,
      message: n.message,
      link: n.link,
      isRead: n.isRead,
      createdAt: n.createdAt,
    })),
    unreadCount,
  };
}

/**
 * Marks a single notification as read, enforcing ownership.
 */
export async function markAsRead(notificationId, userId) {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { $set: { isRead: true } },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, 'NOTIFICATION_NOT_FOUND', 'Notification not found.');
  }

  return {
    id: notification._id.toString(),
    isRead: notification.isRead,
  };
}

/**
 * Marks all notifications for a user as read.
 */
export async function markAllAsRead(userId) {
  const result = await Notification.updateMany(
    { userId, isRead: false },
    { $set: { isRead: true } }
  );

  return { modifiedCount: result.modifiedCount };
}

export default {
  createNotification,
  listNotifications,
  markAsRead,
  markAllAsRead,
};
