const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketHandler = (io) => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password -refreshTokens');
      
      if (!user || !user.isActive) {
        return next(new Error('Authentication error'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.email} connected`);

    // Join user to their role-based room
    socket.join(socket.user.role);
    socket.join(`user_${socket.user._id}`);

    // Handle joining class/subject rooms for teachers and students
    socket.on('join_class', (classId) => {
      socket.join(`class_${classId}`);
    });

    socket.on('join_subject', (subjectId) => {
      socket.join(`subject_${subjectId}`);
    });

    // Handle real-time messaging
    socket.on('send_notification', (data) => {
      if (data.target === 'all') {
        socket.broadcast.emit('notification', data);
      } else if (data.target.startsWith('class_')) {
        socket.to(data.target).emit('notification', data);
      } else if (data.target.startsWith('user_')) {
        socket.to(data.target).emit('notification', data);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.user.email} disconnected`);
    });
  });
};

module.exports = socketHandler;