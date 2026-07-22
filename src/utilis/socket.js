import { io } from "socket.io-client";
import { getToken } from "./storage";

const SOCKET_URL = "http://localhost:5000";

let socket = null;

export const connectSocket = () => {
  if (socket?.connected) return socket;

  const token = getToken();
  if (!token) return null;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket"],
    reconnectionAttempts: 5,
  });

  socket.on("connect_error", (err) => {
    console.warn("[socket] connect error:", err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
