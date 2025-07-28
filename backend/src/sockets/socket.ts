import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server;
const userSocketMap = new Map<string, string>(); // userId -> socketId

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket: Socket) => {
    // Client should emit 'register' with their userId after connecting
    socket.on('register', (userId: string) => {
      userSocketMap.set(userId, socket.id);
    });

    socket.on('disconnect', () => {
      for (const [userId, sockId] of userSocketMap.entries()) {
        if (sockId === socket.id) userSocketMap.delete(userId);
      }
    });
  });
};

export const getIO = () => io;
export const getUserSocketId = (userId: string) => userSocketMap.get(userId);

export const getAdminSocketIds = (adminUserIds: string[]) => {
  return adminUserIds.map(id => userSocketMap.get(id)).filter(Boolean);
}; 