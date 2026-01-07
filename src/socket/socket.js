// src/socket/socket.js
import { Server } from "socket.io";
import {verifyAccessToken} from "../utils/jwt.js";
import Controller from "../models/controllerModel.js";

// đưa user vào room của controller của mk
export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  // Middleware xác thực socket
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) return next(new Error("Missing token"));

      const payload = verifyAccessToken(token);
      socket.user = { id: payload._id || payload.id };
      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", async (socket) => { // socket đại diện cho kết nối của 1 user cụ thể
    console.log("[WS] User connected socket:", socket.user.id);

    // Lấy controller user có quyền
    const controllers = await Controller.find({
      owner_id: socket.user.id,
    }).select("_id");

    // socket join vào room theo controller
    controllers.forEach((c) => {
      socket.join(`controller:${c._id.toString()}`);
    });

    socket.on("disconnect", () => {
      console.log("[WS] User disconnected:", socket.user.id);
    });
  });

  return io;
}
