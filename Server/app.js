import express from "express";
import { createServer } from "http";
import { connect } from "http2";
import { Server } from "socket.io";

const app = express();
const SOCKET_PORT = 3000;

const rooms = {};

const server = createServer(app);
const io = new Server(server, { cors: { origin: "*", credentials: true } });

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", ({ roomId, role }) => {
    if (!rooms[roomId]) {
      rooms[roomId] = { interviewer: null, interviewee: null };
    }

    Object.keys(rooms).forEach((existingRoom) => {
      if (rooms[existingRoom].interviewer === socket.id || rooms[existingRoom].interviewee === socket.id) {
        if (rooms[existingRoom].interviewer === socket.id) rooms[existingRoom].interviewer = null;
        if (rooms[existingRoom].interviewee === socket.id) rooms[existingRoom].interviewee = null;
        socket.leave(existingRoom);
      }
    });

    if (role === "Interviewer") {
      if (rooms[roomId].interviewer) {
        socket.emit("room-error", "Interviewer is already in the room.");
        return;
      }
      rooms[roomId].interviewer = socket.id;
    } else if (role === "Interviewee") {
      if (!rooms[roomId].interviewer) {
        socket.emit("room-error", "Interviewer is not present, wait!");
        return;
      }
      if (rooms[roomId].interviewee) {
        socket.emit("room-error", "Interviewee is already in the room.");
        return;
      }
      socket.broadcast.to(roomId).emit("user:joined",{id:socket.id});//for  starting webrtc connection
      rooms[roomId].interviewee = socket.id;
    }

    socket.data.roomId = roomId;
    socket.join(roomId);
    socket.emit("room-joined", { roomId });
    
    console.log(`${role} joined room ${roomId}`);
  });

  // webrtc implementations
  socket.on("user:call", ({ to, offer }) => {
    // console.log("user:call");
    // console.log("to",to);
    // console.log("from",socket.id);
    io.to(to).emit("incoming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    // console.log("call:accepted");
    // console.log("to",to);
    // console.log("from",socket.id);
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    // console.log("peer:nego:neede");
    // console.log("to",to);
    // console.log("from",socket.id);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    // console.log("peer:nego:done");
    // console.log("to",to);
    // console.log("from",socket.id);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });

  socket.on("initiate:send:streams",({to})=>{{
    // console.log("asking for streams");
    io.to(to).emit("send:streams", { from: socket.id});
  }})

  socket.on("call:ended", ({ to }) => {
    console.log("call end initiated");
    io.to(to).emit("endCall");
  });

  
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    for (const room in rooms) {
      if (rooms[room].interviewer === socket.id) rooms[room].interviewer = null;
      if (rooms[room].interviewee === socket.id) rooms[room].interviewee = null;
    }
  });
});

server.listen(SOCKET_PORT, () => {
  console.log(`Socket Server -> http://localhost:${SOCKET_PORT}`);
});
