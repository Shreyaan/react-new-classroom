import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
const app = express();
app.use(cors());

app.get("/ping", (req, res) => {
  res.json({ message: "true" });
});

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const rooms = {};

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("createRoom", (roomId) => {
    console.log(`Room ${roomId} has been created`);

    // Store the socket id of the room owner
    const roomOwnerSocketId = socket.id;

    // Set the room object in the rooms object
    rooms[roomId] = {
      ownerSocketId: roomOwnerSocketId,
      membersSocketIds: [roomOwnerSocketId],
    };

    // Join the room
    socket.join(roomId);

    // Emit to the room owner that the room has been successfully created
    io.to(roomOwnerSocketId).emit("roomCreated", roomId);
  });

  socket.on("joinRoom", (roomId) => {
    console.log(`User has joined room ${roomId}`);

    const room = rooms[roomId];

    // If the room doesn't exist, then emit an error to the user
    if (!room) {
      io.to(socket.id).emit("joinRoomError", `Room ${roomId} does not exist`);
      return;
    }

    // Store the socket id of the new room member
    room.membersSocketIds.push(socket.id);

    // Join the room
    socket.join(roomId);

    // Emit to the room owner that a new member has joined the room
    io.to(room.ownerSocketId).emit("newMemberJoinedRoom", socket.id);
  });

  socket.on("sendData", (roomId, data) => {
    console.log(`Room ${roomId}: ${data}`);

    // Emit the data to all other members of the room
    const membersSocketIds = rooms[roomId]?.membersSocketIds;
    membersSocketIds?.forEach((memberSocketId) => {
      if (memberSocketId !== socket.id) {
        io.to(memberSocketId).emit("dataReceived", data);
      }
    });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");

    // Remove the socket id from the list of members in each room
    Object.keys(rooms).forEach((roomId) => {
      const room = rooms[roomId];
      const index = room.membersSocketIds.indexOf(socket.id);
      if (index !== -1) {
        room.membersSocketIds.splice(index, 1);
        io.to(room.ownerSocketId).emit("memberLeftRoom", socket.id);
      }
    });
  });
});

server.listen(3001, () => {
  console.log("listening on *:3001");
});
