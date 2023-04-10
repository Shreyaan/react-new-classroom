const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*"
  }
});

let rooms = {};

io.on("connection", (socket) => {
  console.log("A user has connected");

  socket.on("createRoom", (roomName) => {
    if (!rooms[roomName]) {
      rooms[roomName] = [];
    }
    console.log(`Room ${roomName} has been created`);
    socket.join(roomName);
    rooms[roomName].push(socket);
  });

  socket.on("sendDataToRoom", (roomName, data) => {
    if (rooms[roomName] && rooms[roomName].includes(socket)) {
      console.log(`Data ${JSON.stringify(data)} has been sent to room ${roomName}`);
      socket.to(roomName).emit("newData", data);
    } else {
      console.log(`Socket is not a part of room ${roomName}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user has disconnected");
    for (let roomName in rooms) {
      if (rooms[roomName].includes(socket)) {
        rooms[roomName] = rooms[roomName].filter((roomSocket) => roomSocket !== socket);
        console.log(`Socket has left room ${roomName}`);
      }
    }
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});