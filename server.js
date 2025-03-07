// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const cors = require("cors");

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
//   transports: ["websocket"],
// });

// app.use(
//   cors({
//     origin: "*",
//     methods: ["GET", "POST"],
//     allowedHeaders: ["Content-Type"],
//     credentials: true,
//   })
// );

// const players = {}; // Store all players
// const ROOM_NAME = "game-room"; // Define a room name

// io.on("connection", (socket) => {
//   console.log(`New player connected: ${socket.id}`);
//   socket.join(ROOM_NAME);

//   // Handle new player joining with name & image
//   socket.on("newPlayer", (data) => {
//     console.log(`🎮 Player ${socket.id} joined with name: ${data.name}`);

//     // Convert the received Blob to a Buffer
//     const imageBuffer = Buffer.from(new Uint8Array(data.image));

//     // Generate a random color for the player
//     const randomColor = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${
//       Math.random() * 255
//     })`;

//     // Assign a random starting position
//     const spawnPosition = { x: 2, y: 4, z: 10 };

//     // Store player data
//     players[socket.id] = {
//       id: socket.id,
//       name: data.name,
//       image: imageBuffer.toString("base64"), // Store as base64 string
//       color: randomColor,
//       ...spawnPosition,
//     };

//     // Send the new player's data to all clients
//     io.to(ROOM_NAME).emit("playerJoined", players[socket.id]);

//     // Send all existing players to the new client
//     socket.emit("existingPlayers", players);
//   });

//   // Handle player movement updates
//   socket.on("updatePosition", (data) => {
//     if (players[socket.id]) {
//       players[socket.id].x = data.x;
//       players[socket.id].y = data.y;
//       players[socket.id].z = data.z;

//       // Broadcast movement only within the room
//       socket.to(ROOM_NAME).emit("playerMoved", players[socket.id]);
//     }
//   });

//   // Handle video streaming
//   socket.on("message", (message) => {
//     socket.broadcast.emit("message", message);
//   });

//   // Handle player disconnection
//   socket.on("disconnect", () => {
//     console.log(`❌ Player disconnected: ${socket.id}`);
//     delete players[socket.id];

//     // Notify all clients in the room about the disconnected player
//     io.to(ROOM_NAME).emit("playerLeft", socket.id);
//   });
// });

// // Global error handler
// function errorHandler(err, req, res, next) {
//   console.error(err.stack);
//   res.status(500).send("Internal Server Error");
// }
// app.use(errorHandler);

// const PORT = 5000;
// server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  transports: ["websocket"],
});

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

const players = {}; // Store all players
const ROOM_NAME = "game-room"; // Define a room name
const activeRooms = {}; // Track clients in rooms for WebRTC

io.on("connection", (socket) => {
  console.log(`New player connected: ${socket.id}`);
  socket.join(ROOM_NAME);

  // Track clients in room for WebRTC mesh topology
  if (!activeRooms[ROOM_NAME]) {
    activeRooms[ROOM_NAME] = [];
  }
  activeRooms[ROOM_NAME].push(socket.id);

  // Handle new player joining with name & image
  socket.on("newPlayer", (data) => {
    console.log(`🎮 Player ${socket.id} joined with name: ${data.name}`);

    // Convert the received Blob to a Buffer
    const imageBuffer = Buffer.from(new Uint8Array(data.image));

    // Generate a random color for the player
    const randomColor = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${
      Math.random() * 255
    })`;

    // Assign a random starting position
    const spawnPosition = { x: 2, y: 4, z: 10 };

    // Store player data
    players[socket.id] = {
      id: socket.id,
      name: data.name,
      image: imageBuffer.toString("base64"), // Store as base64 string
      color: randomColor,
      ...spawnPosition,
    };

    // Send the new player's data to all clients
    io.to(ROOM_NAME).emit("playerJoined", players[socket.id]);

    // Send all existing players to the new client
    socket.emit("existingPlayers", players);

    // For WebRTC mesh topology - inform the new user about existing peers
    const existingPeers = activeRooms[ROOM_NAME].filter(
      (id) => id !== socket.id
    );
    if (existingPeers.length > 0) {
      socket.emit("existingPeers", existingPeers);
    }
  });

  // Handle player movement updates
  socket.on("updatePosition", (data) => {
    if (players[socket.id]) {
      players[socket.id].x = data.x;
      players[socket.id].y = data.y;
      players[socket.id].z = data.z;

      // Broadcast movement only within the room
      socket.to(ROOM_NAME).emit("playerMoved", players[socket.id]);
    }
  });

  // Handle WebRTC signaling with specific peers
  socket.on("rtcSignal", (data) => {
    console.log(`Signal from ${socket.id} to ${data.peerId}`);
    if (io.sockets.sockets.has(data.peerId)) {
      io.to(data.peerId).emit("rtcSignal", {
        signal: data.signal,
        from: socket.id,
      });
    }
  });

  // Handle player disconnection
  socket.on("disconnect", () => {
    console.log(`❌ Player disconnected: ${socket.id}`);

    // Remove from active rooms tracking
    if (activeRooms[ROOM_NAME]) {
      const index = activeRooms[ROOM_NAME].indexOf(socket.id);
      if (index > -1) {
        activeRooms[ROOM_NAME].splice(index, 1);
      }
    }

    delete players[socket.id];

    // Notify all clients in the room about the disconnected player
    io.to(ROOM_NAME).emit("playerLeft", socket.id);
  });
});

// Global error handler
function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Internal Server Error");
}
app.use(errorHandler);

const PORT = 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
