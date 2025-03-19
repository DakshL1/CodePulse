import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const SOCKET_PORT = 3000;

const rooms = {}; // Stores room data

const server = createServer(app);
const io = new Server(server, { cors: { origin: '*', credentials: true } });

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle room joining logic
    socket.on('join-room', ({ roomId, role }) => {
        // If room doesn't exist, create it
        if (!rooms[roomId]) {
            rooms[roomId] = { interviewer: null, interviewee: null };
        }

        // Remove user from any existing room before joining a new one
        Object.keys(rooms).forEach(existingRoom => {
            if (rooms[existingRoom].interviewer === socket.id || rooms[existingRoom].interviewee === socket.id) {
                if (rooms[existingRoom].interviewer === socket.id) rooms[existingRoom].interviewer = null;
                if (rooms[existingRoom].interviewee === socket.id) rooms[existingRoom].interviewee = null;
                socket.leave(existingRoom);
            }
        });

        if (role === 'Interviewer') {
            if (rooms[roomId].interviewer) {
                socket.emit("room-error", "Interviewer is already in the room.");
                return;
            }
            rooms[roomId].interviewer = socket.id;
        } else if (role === 'Interviewee') {
            // ✅ Fix: Now the interviewer check happens after ensuring the room exists
            if (!rooms[roomId].interviewer) {
                socket.emit("room-error", "Interviewer is not present, wait!");
                return;
            }
            if (rooms[roomId].interviewee) {
                socket.emit("room-error", "Interviewee is already in the room.");
                return;
            }
            rooms[roomId].interviewee = socket.id;
        }

        socket.data.roomId = roomId; // Store roomId in socket data
        socket.join(roomId);
        socket.emit("room-joined", { roomId });
        console.log(`${role} joined room ${roomId}`);
    });

    // Handle real-time code updates
    socket.on('update-code', ({ newCode, roomId }) => {
        io.to(roomId).emit('send-code', newCode);
    });

    // Handle language selection updates
    socket.on("update-language", ({ language, roomId }) => {
        io.to(roomId).emit("send-language", language);
    });

    // Handle messaging in the interview room
    socket.on("send-message", ({ message, roomId, senderUserName }) => {
        const fullMessage = { text: message.text, sender: socket.id, senderUserName };
        io.to(roomId).emit("receive-message", fullMessage);
    });

    // Handle interviewer sending a question with test cases
    socket.on("send-question", ({ question, testCases, roomId }) => {
        console.log(`Question sent in room ${roomId}:`, question);
        io.to(roomId).emit("receive-question", { question, testCases });
    });

    socket.on("send-output",({testCases,roomId})=>{
        console.log(`Updating output in ${roomId}`);
        io.to(roomId).emit("update-output",testCases);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        for (const room in rooms) {
            if (rooms[room].interviewer === socket.id) rooms[room].interviewer = null;
            if (rooms[room].interviewee === socket.id) rooms[room].interviewee = null;
        }
    });
});

// Start server
server.listen(SOCKET_PORT, () => {
    console.log(`Socket Server -> http://localhost:${SOCKET_PORT}`);
});
