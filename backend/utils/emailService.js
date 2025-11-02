const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendEmail(to, subject, html, attachments = []) {
    try {
      const mailOptions = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to,
        subject,
        html,
        attachments
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(user, tempPassword) {
    const subject = 'Welcome to School Management System';
    const html = `
      <h2>Welcome ${user.profile.firstName}!</h2>
      <p>Your account has been created successfully.</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Temporary Password:</strong> ${tempPassword}</p>
      <p>Please login and change your password immediately.</p>
      <p>Best regards,<br>School Management Team</p>
    `;
    
    return this.sendEmail(user.email, subject, html);
  }

  async sendNoticeEmail(user, notice) {
    const subject = `New Notice: ${notice.title}`;
    const html = `
      <h2>${notice.title}</h2>
      <p><strong>Type:</strong> ${notice.type}</p>
      <p><strong>Priority:</strong> ${notice.priority}</p>
      <div>${notice.content}</div>
      <p><strong>Published on:</strong> ${notice.publishDate.toDateString()}</p>
      <p>Best regards,<br>School Management Team</p>
    `;
    
    return this.sendEmail(user.email, subject, html);
  }

  async sendLeaveStatusEmail(user, leave) {
    const subject = `Leave Application ${leave.status}`;
    const html = `
      <h2>Leave Application Update</h2>
      <p>Your leave application has been <strong>${leave.status}</strong>.</p>
      <p><strong>Leave Type:</strong> ${leave.type}</p>
      <p><strong>Duration:</strong> ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}</p>
      ${leave.comments ? `<p><strong>Comments:</strong> ${leave.comments}</p>` : ''}
      <p>Best regards,<br>School Management Team</p>
    `;
    
    return this.sendEmail(user.email, subject, html);
  }

  async sendFeeReminderEmail(user, student) {
    const subject = 'Fee Payment Reminder';
    const html = `
      <h2>Fee Payment Reminder</h2>
      <p>Dear ${user.profile.firstName},</p>
      <p>This is a reminder that fees are pending for student: ${student.user.profile.firstName} ${student.user.profile.lastName}</p>
      <p><strong>Total Fees:</strong> ₹${student.feeStatus.totalFees}</p>
      <p><strong>Paid:</strong> ₹${student.feeStatus.paidFees}</p>
      <p><strong>Pending:</strong> ₹${student.feeStatus.pendingFees}</p>
      <p>Please make the payment at your earliest convenience.</p>
      <p>Best regards,<br>School Management Team</p>
    `;
    
    return this.sendEmail(user.email, subject, html);
  }
}

module.exports = new EmailService();