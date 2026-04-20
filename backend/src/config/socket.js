const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

function createSocket(server, corsOptions = {}) {
  const io = new Server(server, { cors: corsOptions });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];
      if (!token) return next(new Error('Unauthorized'));
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = payload;
      return next();
    } catch (err) {
      return next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user?.id || socket.user?._id;
    if (userId) socket.join(`user_${userId}`);

    socket.on('join_chat', (chatId) => socket.join(`chat_${chatId}`));
    socket.on('leave_chat', (chatId) => socket.leave(`chat_${chatId}`));
    socket.on('typing_start', (chatId) => socket.to(`chat_${chatId}`).emit('typing_start', { chatId, userId }));
    socket.on('typing_stop', (chatId) => socket.to(`chat_${chatId}`).emit('typing_stop', { chatId, userId }));
    socket.on('send_message', ({ chatId, message }) => io.to(`chat_${chatId}`).emit('new_message', { chatId, message }));
    socket.on('mark_read', ({ chatId, messageId }) => io.to(`chat_${chatId}`).emit('message_read', { chatId, messageId, userId }));
  });

  const emitToUser = (targetUserId, event, payload) => io.to(`user_${targetUserId}`).emit(event, payload);
  return { io, emitToUser };
}

module.exports = { createSocket };
