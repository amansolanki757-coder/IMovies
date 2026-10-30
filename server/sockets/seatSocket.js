export const initSeatSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join specific show room
    socket.on('join:show', (showId) => {
      socket.join(`show_${showId}`);
      console.log(`[Socket.io] Socket ${socket.id} joined room show_${showId}`);
    });

    // Leave show room
    socket.on('leave:show', (showId) => {
      socket.leave(`show_${showId}`);
      console.log(`[Socket.io] Socket ${socket.id} left room show_${showId}`);
    });

    // Broadcast seat locked event
    socket.on('seat:lock', ({ showId, seatNumbers, userId }) => {
      socket.to(`show_${showId}`).emit('seat:locked', {
        seatNumbers,
        lockedBy: userId,
      });
    });

    // Broadcast seat released event
    socket.on('seat:release', ({ showId, seatNumbers }) => {
      socket.to(`show_${showId}`).emit('seat:released', {
        seatNumbers,
      });
    });

    // Broadcast seat booked event
    socket.on('seat:booked', ({ showId, seatNumbers }) => {
      socket.to(`show_${showId}`).emit('seat:booked', {
        seatNumbers,
      });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });
};

