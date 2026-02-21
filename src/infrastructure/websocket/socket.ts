import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../../shared/config/env';
import { AuthPayload } from '../../shared/middleware/auth';

let io: Server;

export function initializeSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('AUTH_INVALID_TOKEN'));
    }
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
      socket.data.user = payload;
      next();
    } catch {
      next(new Error('AUTH_INVALID_TOKEN'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.user.userId;
    socket.join(`user:${userId}`);
    console.log(`User connected: ${userId}`);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('INTERNAL_ERROR');
  }
  return io;
}
