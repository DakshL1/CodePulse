import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const SOCKET_PORT = 3000;

const rooms = {};
let gameRoomId="";

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

  socket.on('update-code', ({ newCode, roomId }) => {
        socket.broadcast.to(roomId).emit('send-code', newCode);
    });

    // Handle language selection updates
    socket.on("update-language", ({ language, roomId }) => {
      socket.broadcast.to(roomId).emit("send-language", language);
    });

    // Handle messaging in the interview room
    socket.on("send-message", ({ message, roomId, senderUserName }) => {
        const fullMessage = { text: message.text, sender: socket.id, senderUserName };
        socket.broadcast.to(roomId).emit("receive-message", fullMessage);
    });

    // Handle interviewer sending a question with test cases
    socket.on("send-question", ({ question, testCases, roomId }) => {
        console.log(`Question sent in room ${roomId}:`, question);
        io.to(roomId).emit("receive-question", { question, testCases });
    });

    socket.on("send-output",({testCases,roomId})=>{
        console.log(`Updating output in ${roomId}`);
        socket.broadcast.to(roomId).emit("update-output",testCases);
    });


  // Game Mode: Join room
  socket.on("join-game-room", ({ roomId }) => {
    socket.join(roomId);
    socket.data.gameRoomId = roomId;
    console.log(`(GameMode) ${socket.id} joined room ${roomId}`);
    
  });

  // Game Mode: Player updates their code
  socket.on("update-player-code", ({ code, roomId }) => {
    socket.to(roomId).emit("receive-opponent-code", { code });
  });

  // Game Mode: Run code and return output to sender
  socket.on("run-code", async ({ code, language, roomId }) => {
    // Replace with your actual Judge0 or code runner integration
    console.log(`Running code in ${language} from room ${roomId}`);

    const output = `Mock output for language: ${language}`; // Simulate result
    socket.emit("receive-run-output", { output });
  });

  // Game Mode: Send input/output to opponent
  socket.on("update-player-io", ({ input, output, roomId }) => {
    socket.to(roomId).emit("opponent-io", { input, output });
  });

  // Game Mode: Send question to opponent
  socket.on("send-question", ({ question, roomId }) => {
    console.log(`(GameMode) Question sent in room ${roomId}: ${question}`);
    socket.to(roomId).emit("receive-question", { question });
  });

  // Game Mode: Leave Room
  socket.on("leave-game-room", ({ roomId }) => {
    console.log(`(GameMode) ${socket.id} left room ${roomId}`);
    socket.leave(roomId);
    socket.to(roomId).emit("opponent-left");
  });

  socket.on("start-timer", ({ roomId, timeLeft }) => {
    socket.to(roomId).emit("start-timer", { timeLeft });
  });

  socket.on("stop-timer", ({ roomId }) => {
    socket.to(roomId).emit("stop-timer");
  });
  
  socket.on("reset-timer", ({ roomId }) => {
    socket.to(roomId).emit("reset-timer");
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
