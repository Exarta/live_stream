import { io } from "socket.io-client";

// ✅ Initialize socket connection once
const SOCKET_URL = "http://172.16.15.155:5000"; // Change this to your backend URL

const socket = io(SOCKET_URL, {
  transports: ["websocket"], // Force WebSocket connection
});

export default socket; // ✅ Export the socket instance
