// SocketContext.js
import React, { createContext } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socket = io("http://172.16.15.155:5000", { transports: ["websocket"] });
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
