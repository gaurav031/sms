const Notification = require('../models/Notification');
const emailService = require('./emailService');

class NotificationService {
  async createNotification(recipient, title, message, type, data = null, priority = 'medium') {
    try {
      const notification = new Notification({
        recipient,
        title,
        message,
        type,
        data,
        priority
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async sendRealTimeNotification(io, userId, notification) {
    try {
      io.to(`user_${userId}`).emit('notification', {
        id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority,
        createdAt: notification.createdAt
      });
    } catch (error) {
      console.error('Error sending real-time notification:', error);
    }
  }

  async notifyUser(io, recipient, title, message, type, data = null, priority = 'medium', sendEmail = false) {
    try {
      // Create database notification
      const notification = await this.createNotification(recipient._id, title, message, type, data, priority);

      // Send real-time notification
      await this.sendRealTimeNotification(io, recipient._id, notification);

      // Send email if requested
      if (sendEmail) {
        await this.sendEmailNotification(recipient, title, message, type, data);
      }

      return notification;
    } catch (error) {
      console.error('Error in notifyUser:', error);
      throw error;
    }
  }

  async sendEmailNotification(user, title, message, type, data) {
    try {
      const subject = title;
      const html = `
        <h2>${title}</h2>
        <p>${message}</p>
        <p><strong>Type:</strong> ${type}</p>
        <p>Best regards,<br>School Management Team</p>
      `;
      
      await emailService.sendEmail(user.email, subject, html);
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { isRead: true, readAt: new Date() },
        { new: true }
      );

      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async getUserNotifications(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      
      const notifications = await Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('recipient', 'profile.firstName profile.lastName email');

      const total = await Notification.countDocuments({ recipient: userId });
      const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

      return {
        notifications,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          unreadCount
        }
      };
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();